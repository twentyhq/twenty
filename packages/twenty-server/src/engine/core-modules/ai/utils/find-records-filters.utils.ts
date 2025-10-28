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
import { isDefined } from 'twenty-shared/utils';

type FilterObject = Record<string, unknown>;

type WhereRecord = Record<string, unknown>;

const isSkippableValue = (value: unknown): boolean =>
  !isDefined(value) || value === '';

const isPlainObject = (value: unknown): value is FilterObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseFilterCondition = (filterValue: FilterObject): unknown => {
  if ('eq' in filterValue) {
    return filterValue.eq;
  }
  if ('neq' in filterValue) {
    return Not(filterValue.neq as unknown);
  }
  if ('gt' in filterValue) {
    return MoreThan(filterValue.gt as unknown as number | string | Date);
  }
  if ('gte' in filterValue) {
    return MoreThanOrEqual(
      filterValue.gte as unknown as number | string | Date,
    );
  }
  if ('lt' in filterValue) {
    return LessThan(filterValue.lt as unknown as number | string | Date);
  }
  if ('lte' in filterValue) {
    return LessThanOrEqual(
      filterValue.lte as unknown as number | string | Date,
    );
  }
  if ('in' in filterValue) {
    const values = (filterValue as { in: unknown }).in;

    return Array.isArray(values) ? In(values as unknown[]) : null;
  }
  if ('like' in filterValue) {
    return Like(filterValue.like as string);
  }
  if ('ilike' in filterValue) {
    return ILike(filterValue.ilike as string);
  }
  if ('startsWith' in filterValue) {
    return Like(`${String(filterValue.startsWith)}%`);
  }
  if ('is' in filterValue) {
    const v = (filterValue as { is: unknown }).is;

    if (v === 'NULL') return IsNull();
    if (v === 'NOT_NULL') return Not(IsNull());
  }
  if ('isEmptyArray' in filterValue) {
    return [];
  }
  if ('containsIlike' in filterValue) {
    return Like(`%${String(filterValue.containsIlike)}%`);
  }

  return null;
};

export const buildWhereConditions = (
  searchCriteria: FilterObject,
): WhereRecord => {
  return Object.entries(searchCriteria).reduce<WhereRecord>(
    (acc, [key, value]) => {
      if (isSkippableValue(value)) {
        return acc;
      }

      if (isPlainObject(value)) {
        // Direct operator-based condition (eq, ilike, etc.)
        const filterCondition = parseFilterCondition(value as FilterObject);

        if (isDefined(filterCondition)) {
          acc[key] = filterCondition;

          return acc;
        }

        // Otherwise, try to build nested conditions
        const nestedConditions = buildWhereConditions(value);

        if (Object.keys(nestedConditions).length > 0) {
          acc[key] = nestedConditions;
        }

        return acc;
      }

      acc[key] = value as unknown;

      return acc;
    },
    {},
  );
};
