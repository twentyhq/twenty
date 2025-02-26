import {
  Brackets,
  ObjectLiteral,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';

/**
 * Defines supported filter comparators mapped to SQL operators.
 */
const COMPARATOR_MAP: Record<string, string> = {
  eq: '=',
  neq: '!=',
  in: 'IN',
  containsAny: 'LIKE',
  is: 'IS',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  startsWith: 'LIKE',
  like: 'LIKE',
  ilike: 'ILIKE',
};

/**
 * Type definition for a filter condition.
 */
interface FilterCondition {
  field: string;
  comparator: keyof typeof COMPARATOR_MAP;
  value: string;
}

/**
 * Type definition for nested filters (AND, OR, NOT).
 */
interface NestedFilter {
  type: 'and' | 'or' | 'not';
  conditions: (FilterCondition | NestedFilter)[];
}

/**
 * Splits filter conditions while handling nested expressions.
 */
function splitFilterConditions(input: string): string[] {
  const conditions: string[] = [];
  let buffer = '';
  let depth = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '(') depth++;
    if (char === ')') depth--;

    if (char === ',' && depth === 0) {
      conditions.push(buffer.trim());
      buffer = '';
    } else {
      buffer += char;
    }
  }

  if (buffer) conditions.push(buffer.trim());

  return conditions;
}

/**
 * Parses a filter string into a structured object.
 */
function parseFilterString(
  filterString: string,
): NestedFilter | FilterCondition[] {
  if (!filterString) return [];

  const match = filterString.match(/^(and|or|not)\((.+)\)$/);

  if (match) {
    const [, conjunction, inner] = match;
    const conditions = splitFilterConditions(inner).map(parseFilterString);

    // Flatten conditions array properly
    return {
      type: conjunction as 'and' | 'or' | 'not',
      conditions: conditions.flat() as (FilterCondition | NestedFilter)[],
    };
  }

  return filterString.split(',').map((filter) => {
    const match = filter.match(/([\w.]+)\[([a-zA-Z]+)\]:(.+)/);

    if (!match) throw new Error(`Invalid filter format: ${filter}`);

    const [, field, comparator, value] = match;

    return {
      field,
      comparator: comparator as keyof typeof COMPARATOR_MAP,
      value,
    };
  });
}

/**
 * Applies parsed filters to a QueryBuilder recursively.
 */
function applyFilters(
  qb: WhereExpressionBuilder,
  alias: string,
  filter: NestedFilter | FilterCondition[],
): void {
  if (Array.isArray(filter)) {
    // If it's an array of FilterCondition, apply them individually
    filter.forEach((condition, index) =>
      applySingleFilter(qb, alias, condition, index),
    );

    return;
  }

  qb[filter.type === 'or' ? 'orWhere' : 'andWhere'](
    new Brackets((subQb) => {
      filter.conditions.forEach((condition, index) => {
        if (Array.isArray(condition)) {
          condition.forEach((c, i) => applySingleFilter(subQb, alias, c, i));
        } else if ('field' in condition) {
          // Handle NOT case
          if (filter.type === 'not') {
            subQb.andWhere(
              `NOT (${alias}.${condition.field} ${COMPARATOR_MAP[condition.comparator]} :param${index})`,
              { [`param${index}`]: condition.value },
            );
          } else {
            applySingleFilter(subQb, alias, condition, index);
          }
        } else {
          // Recursively process nested conditions
          applyFilters(subQb, alias, condition);
        }
      });
    }),
  );
}

/**
 * Applies an individual filter condition.
 */
function applySingleFilter(
  qb: WhereExpressionBuilder,
  alias: string,
  condition: FilterCondition,
  index: number,
): void {
  const { field, comparator, value } = condition;
  const paramKey = `param${index}`;

  if (!COMPARATOR_MAP[comparator]) {
    throw new Error(`Invalid comparator: ${comparator}`);
  }

  let conditionString = `${alias}.${field} ${COMPARATOR_MAP[comparator]} :${paramKey}`;
  let paramValue: string | string[] = value;

  if (comparator === 'is' && (value === 'NULL' || value === 'NOT_NULL')) {
    conditionString = `${alias}.${field} IS ${value === 'NULL' ? 'NULL' : 'NOT NULL'}`;
  } else if (comparator === 'in') {
    paramValue = value.split('|');
  } else if (comparator === 'containsAny' || comparator === 'startsWith') {
    paramValue = `%${value}%`;
  }

  qb.andWhere(conditionString, { [paramKey]: paramValue });
}

/**
 * Builds a QueryBuilder with filters applied.
 */
export function buildQueryWithFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  filterString: string,
): SelectQueryBuilder<T> {
  if (!filterString) return qb;

  const filters = parseFilterString(filterString);

  return qb.andWhere(
    new Brackets((subQb) => {
      applyFilters(subQb, alias, filters);
    }),
  );
}
