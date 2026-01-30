import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  parseClickHouseFilter,
  parseClickHouseOrderBy,
} from './clickhouse-filter-parser.util';

type ClickHouseSelectQueryOptions = {
  tableName: string;
  columns?: string[];
  filter?: ObjectRecordFilter;
  orderBy?: Array<Record<string, string>>;
  limit?: number;
  offset?: number;
  workspaceId?: string;
};

type ClickHouseCountQueryOptions = {
  tableName: string;
  filter?: ObjectRecordFilter;
  workspaceId?: string;
};

type ClickHouseGroupByQueryOptions = {
  tableName: string;
  groupByColumns: string[];
  aggregations?: Array<{
    column: string;
    function: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
    alias: string;
  }>;
  filter?: ObjectRecordFilter;
  orderBy?: Array<Record<string, string>>;
  limit?: number;
  workspaceId?: string;
};

type ClickHouseQueryResult = {
  query: string;
  params: Record<string, unknown>;
};

export const buildClickHouseSelectQuery = (
  options: ClickHouseSelectQueryOptions,
): ClickHouseQueryResult => {
  const {
    tableName,
    columns = ['*'],
    filter,
    orderBy,
    limit = 100,
    offset = 0,
    workspaceId,
  } = options;

  const params: Record<string, unknown> = {};

  // Build SELECT clause
  const selectClause =
    columns.length > 0 && columns[0] !== '*'
      ? columns.map((col) => `"${col}"`).join(', ')
      : '*';

  // Build WHERE clause
  const { whereClause, params: filterParams } = parseClickHouseFilter(filter);

  Object.assign(params, filterParams);

  const whereParts: string[] = [];

  if (workspaceId) {
    whereParts.push(`"workspaceId" = {workspaceId:String}`);
    params.workspaceId = workspaceId;
  }

  if (whereClause) {
    whereParts.push(whereClause);
  }

  const fullWhereClause =
    whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

  // Build ORDER BY clause
  const orderByClause = parseClickHouseOrderBy(orderBy);

  // Build LIMIT/OFFSET clause
  const limitClause = `LIMIT ${limit}`;
  const offsetClause = offset > 0 ? `OFFSET ${offset}` : '';

  const query = [
    `SELECT ${selectClause}`,
    `FROM ${tableName}`,
    fullWhereClause,
    orderByClause,
    limitClause,
    offsetClause,
  ]
    .filter(Boolean)
    .join(' ');

  return { query, params };
};

export const buildClickHouseCountQuery = (
  options: ClickHouseCountQueryOptions,
): ClickHouseQueryResult => {
  const { tableName, filter, workspaceId } = options;

  const params: Record<string, unknown> = {};

  // Build WHERE clause
  const { whereClause, params: filterParams } = parseClickHouseFilter(filter);

  Object.assign(params, filterParams);

  const whereParts: string[] = [];

  if (workspaceId) {
    whereParts.push(`"workspaceId" = {workspaceId:String}`);
    params.workspaceId = workspaceId;
  }

  if (whereClause) {
    whereParts.push(whereClause);
  }

  const fullWhereClause =
    whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

  const query = [`SELECT count() as totalCount`, `FROM ${tableName}`, fullWhereClause]
    .filter(Boolean)
    .join(' ');

  return { query, params };
};

export const buildClickHouseGroupByQuery = (
  options: ClickHouseGroupByQueryOptions,
): ClickHouseQueryResult => {
  const {
    tableName,
    groupByColumns,
    aggregations = [],
    filter,
    orderBy,
    limit = 100,
    workspaceId,
  } = options;

  const params: Record<string, unknown> = {};

  // Build SELECT clause with group by columns and aggregations
  const selectParts: string[] = [
    ...groupByColumns.map((col) => `"${col}"`),
    'count() as totalCount',
    ...aggregations.map(
      (agg) => `${agg.function}("${agg.column}") as "${agg.alias}"`,
    ),
  ];

  const selectClause = selectParts.join(', ');

  // Build WHERE clause
  const { whereClause, params: filterParams } = parseClickHouseFilter(filter);

  Object.assign(params, filterParams);

  const whereParts: string[] = [];

  if (workspaceId) {
    whereParts.push(`"workspaceId" = {workspaceId:String}`);
    params.workspaceId = workspaceId;
  }

  if (whereClause) {
    whereParts.push(whereClause);
  }

  const fullWhereClause =
    whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

  // Build GROUP BY clause
  const groupByClause =
    groupByColumns.length > 0
      ? `GROUP BY ${groupByColumns.map((col) => `"${col}"`).join(', ')}`
      : '';

  // Build ORDER BY clause - default to totalCount DESC if not specified
  const orderByClause =
    parseClickHouseOrderBy(orderBy) || 'ORDER BY totalCount DESC';

  // Build LIMIT clause
  const limitClause = `LIMIT ${limit}`;

  const query = [
    `SELECT ${selectClause}`,
    `FROM ${tableName}`,
    fullWhereClause,
    groupByClause,
    orderByClause,
    limitClause,
  ]
    .filter(Boolean)
    .join(' ');

  return { query, params };
};
