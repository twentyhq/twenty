import {
  parseClickHouseFilter,
  parseClickHouseOrderBy,
} from './clickhouse-filter-parser.util';

type ClickHouseSelectQueryOptions = {
  tableName: string;
  columns?: string[];
  filter?: Record<string, unknown>;
  orderBy?: Array<Record<string, string>>;
  limit?: number;
  offset?: number;
  workspaceId?: string;
};

type ClickHouseCountQueryOptions = {
  tableName: string;
  filter?: Record<string, unknown>;
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

  const selectClause =
    columns.length > 0 && columns[0] !== '*'
      ? columns.map((col) => `"${col}"`).join(', ')
      : '*';

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

  const orderByClause = parseClickHouseOrderBy(orderBy);
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

  const query = [
    `SELECT count() as totalCount`,
    `FROM ${tableName}`,
    fullWhereClause,
  ]
    .filter(Boolean)
    .join(' ');

  return { query, params };
};
