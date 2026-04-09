import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type ClickHouseFilterResult = {
  whereClause: string;
  params: Record<string, unknown>;
};

type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'is'
  | 'like'
  | 'ilike'
  | 'startsWith'
  | 'endsWith'
  | 'contains';

const getClickHouseType = (value: unknown): string => {
  if (typeof value === 'string') {
    return 'String';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'Int64' : 'Float64';
  }

  if (typeof value === 'boolean') {
    return 'Bool';
  }

  return 'String';
};

const buildOperatorCondition = (
  fieldName: string,
  operator: FilterOperator,
  paramName: string,
  paramType: string,
): string => {
  switch (operator) {
    case 'eq':
      return `"${fieldName}" = {${paramName}:${paramType}}`;
    case 'neq':
      return `"${fieldName}" != {${paramName}:${paramType}}`;
    case 'gt':
      return `"${fieldName}" > {${paramName}:${paramType}}`;
    case 'gte':
      return `"${fieldName}" >= {${paramName}:${paramType}}`;
    case 'lt':
      return `"${fieldName}" < {${paramName}:${paramType}}`;
    case 'lte':
      return `"${fieldName}" <= {${paramName}:${paramType}}`;
    case 'in':
      return `"${fieldName}" IN {${paramName}:Array(${paramType})}`;
    case 'is':
      return `"${fieldName}" IS NULL`;
    case 'like':
      return `"${fieldName}" LIKE {${paramName}:${paramType}}`;
    case 'ilike':
      return `lower("${fieldName}") LIKE lower({${paramName}:${paramType}})`;
    case 'startsWith':
      return `"${fieldName}" LIKE concat({${paramName}:${paramType}}, '%')`;
    case 'endsWith':
      return `"${fieldName}" LIKE concat('%', {${paramName}:${paramType}})`;
    case 'contains':
      return `"${fieldName}" LIKE concat('%', {${paramName}:${paramType}}, '%')`;
    default:
      return `"${fieldName}" = {${paramName}:${paramType}}`;
  }
};

const parseFilterValue = (
  fieldName: string,
  filterValue: unknown,
  paramIndex: number,
): { conditions: string[]; params: Record<string, unknown> } => {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (!isDefined(filterValue) || typeof filterValue !== 'object') {
    return { conditions, params };
  }

  const filterObj = filterValue as Record<string, unknown>;

  for (const [operator, value] of Object.entries(filterObj)) {
    if (!isDefined(value)) {
      continue;
    }

    const paramName = `${fieldName}_${paramIndex}_${operator}`;

    if (operator === 'is') {
      if (value === 'NULL') {
        conditions.push(`"${fieldName}" IS NULL`);
      } else if (value === 'NOT_NULL') {
        conditions.push(`"${fieldName}" IS NOT NULL`);
      }

      continue;
    }

    const paramType = getClickHouseType(value);

    conditions.push(
      buildOperatorCondition(
        fieldName,
        operator as FilterOperator,
        paramName,
        paramType,
      ),
    );
    params[paramName] = value;
  }

  return { conditions, params };
};

export const parseClickHouseFilter = (
  filter: ObjectRecordFilter | undefined,
): ClickHouseFilterResult => {
  if (!isDefined(filter) || Object.keys(filter).length === 0) {
    return { whereClause: '', params: {} };
  }

  const allConditions: string[] = [];
  const allParams: Record<string, unknown> = {};
  let paramIndex = 0;

  // Handle 'and' operator
  if ('and' in filter && Array.isArray(filter.and)) {
    const andConditions: string[] = [];

    for (const subFilter of filter.and) {
      const { whereClause, params } = parseClickHouseFilter(
        subFilter as ObjectRecordFilter,
      );

      if (whereClause) {
        andConditions.push(`(${whereClause})`);
        Object.assign(allParams, params);
      }
    }

    if (andConditions.length > 0) {
      allConditions.push(andConditions.join(' AND '));
    }
  }

  // Handle 'or' operator
  if ('or' in filter && Array.isArray(filter.or)) {
    const orConditions: string[] = [];

    for (const subFilter of filter.or) {
      const { whereClause, params } = parseClickHouseFilter(
        subFilter as ObjectRecordFilter,
      );

      if (whereClause) {
        orConditions.push(`(${whereClause})`);
        Object.assign(allParams, params);
      }
    }

    if (orConditions.length > 0) {
      allConditions.push(`(${orConditions.join(' OR ')})`);
    }
  }

  // Handle 'not' operator
  if ('not' in filter && isDefined(filter.not)) {
    const { whereClause, params } = parseClickHouseFilter(
      filter.not as ObjectRecordFilter,
    );

    if (whereClause) {
      allConditions.push(`NOT (${whereClause})`);
      Object.assign(allParams, params);
    }
  }

  // Handle field-level filters
  for (const [fieldName, filterValue] of Object.entries(filter)) {
    if (['and', 'or', 'not'].includes(fieldName)) {
      continue;
    }

    const { conditions, params } = parseFilterValue(
      fieldName,
      filterValue,
      paramIndex++,
    );

    allConditions.push(...conditions);
    Object.assign(allParams, params);
  }

  return {
    whereClause: allConditions.join(' AND '),
    params: allParams,
  };
};
