import {
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

/**
 * Parse a single filter condition object (e.g., { ilike: "%foo%" }) into a TypeORM operator or value.
 */
export const parseFilterCondition = (
  filterValue: Record<string, unknown>,
): unknown => {
  if ('eq' in filterValue) {
    return filterValue.eq;
  }
  if ('neq' in filterValue) {
    return Not(filterValue.neq);
  }
  if ('gt' in filterValue) {
    return MoreThan(filterValue.gt);
  }
  if ('gte' in filterValue) {
    return MoreThanOrEqual(filterValue.gte);
  }
  if ('lt' in filterValue) {
    return LessThan(filterValue.lt);
  }
  if ('lte' in filterValue) {
    return LessThanOrEqual(filterValue.lte);
  }
  if ('in' in filterValue) {
    return In(filterValue.in as string[]);
  }
  if ('like' in filterValue) {
    return Like(filterValue.like as string);
  }
  if ('ilike' in filterValue) {
    return ILike(filterValue.ilike as string);
  }
  if ('startsWith' in filterValue) {
    return Like(`${filterValue.startsWith}%`);
  }
  if ('is' in filterValue) {
    if (filterValue.is === 'NULL') {
      return IsNull();
    }
    if (filterValue.is === 'NOT_NULL') {
      return Not(IsNull());
    }
  }
  if ('isEmptyArray' in filterValue) {
    return [];
  }
  if ('containsIlike' in filterValue) {
    return Like(`%${filterValue.containsIlike}%`);
  }

  return null;
};

/**
 * Build nested where conditions for a nested object (e.g., relation filters)
 */
export const buildNestedWhereConditions = (
  nestedValue: Record<string, unknown>,
): Record<string, unknown> => {
  const nestedConditions: Record<string, unknown> = {};

  Object.entries(nestedValue).forEach(([nestedKey, nestedFieldValue]) => {
    if (
      nestedFieldValue === undefined ||
      nestedFieldValue === null ||
      nestedFieldValue === ''
    ) {
      return;
    }

    if (
      typeof nestedFieldValue === 'object' &&
      !Array.isArray(nestedFieldValue)
    ) {
      const filterCondition = parseFilterCondition(
        nestedFieldValue as Record<string, unknown>,
      );

      if (filterCondition !== null) {
        nestedConditions[nestedKey] = filterCondition;
      }
    } else {
      nestedConditions[nestedKey] = nestedFieldValue;
    }
  });

  return nestedConditions;
};

/**
 * Build where conditions compatible with TypeORM from a flexible search criteria object
 */
export const buildWhereConditions = (
  searchCriteria: Record<string, unknown>,
): Record<string, unknown> => {
  const whereConditions: Record<string, unknown> = {};

  Object.entries(searchCriteria).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Direct operator-based condition (eq, ilike, etc.)
      const filterCondition = parseFilterCondition(
        value as Record<string, unknown>,
      );

      if (filterCondition !== null) {
        whereConditions[key] = filterCondition;

        return;
      }

      // Otherwise, try to build nested conditions
      const nestedConditions = buildNestedWhereConditions(
        value as Record<string, unknown>,
      );

      if (Object.keys(nestedConditions).length > 0) {
        whereConditions[key] = nestedConditions;
      }

      return;
    }

    whereConditions[key] = value;
  });

  return whereConditions;
};
