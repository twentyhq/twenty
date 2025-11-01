import type { ChildRecord, DynamicValue, FilterConfig } from './types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const resolveDynamicValue = (dynamicValue: DynamicValue, now: Date) => {
  switch (dynamicValue) {
    case 'startOfYear': {
      const utcStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      return utcStart.toISOString();
    }
    default:
      throw new Error(`Unsupported dynamicValue ${dynamicValue}`);
  }
};

const normalizeForEquality = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return null;
};

export const toComparableNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
    return null;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  return null;
};

const compareValues = (left: unknown, right: unknown): number | null => {
  const leftComparable = toComparableNumber(left);
  const rightComparable = toComparableNumber(right);
  if (leftComparable === null || rightComparable === null) {
    return null;
  }
  return leftComparable - rightComparable;
};

const evaluateFilter = (rawValue: unknown, filter: FilterConfig, now: Date) => {
  const comparisonSource =
    filter.dynamicValue !== undefined
      ? resolveDynamicValue(filter.dynamicValue, now)
      : filter.value;

  switch (filter.operator) {
    case 'equals': {
      const left = normalizeForEquality(rawValue);
      const right = normalizeForEquality(comparisonSource);
      return left !== null && right !== null ? left === right : rawValue === comparisonSource;
    }
    case 'notEquals': {
      const left = normalizeForEquality(rawValue);
      const right = normalizeForEquality(comparisonSource);
      return left !== null && right !== null ? left !== right : rawValue !== comparisonSource;
    }
    case 'in': {
      if (!Array.isArray(comparisonSource)) {
        return false;
      }
      const left = normalizeForEquality(rawValue);
      if (left === null) {
        return false;
      }
      return comparisonSource.map(normalizeForEquality).some((candidate) => candidate === left);
    }
    case 'notIn': {
      if (!Array.isArray(comparisonSource)) {
        return true;
      }
      const left = normalizeForEquality(rawValue);
      if (left === null) {
        return true;
      }
      return !comparisonSource.map(normalizeForEquality).some((candidate) => candidate === left);
    }
    case 'gt': {
      const comparison = compareValues(rawValue, comparisonSource);
      return comparison !== null ? comparison > 0 : false;
    }
    case 'gte': {
      const comparison = compareValues(rawValue, comparisonSource);
      return comparison !== null ? comparison >= 0 : false;
    }
    case 'lt': {
      const comparison = compareValues(rawValue, comparisonSource);
      return comparison !== null ? comparison < 0 : false;
    }
    case 'lte': {
      const comparison = compareValues(rawValue, comparisonSource);
      return comparison !== null ? comparison <= 0 : false;
    }
    default:
      return true;
  }
};

export const getNestedValue = (record: ChildRecord, pathExpression: string): unknown => {
  if (!pathExpression.includes('.')) {
    return record[pathExpression];
  }

  return pathExpression.split('.').reduce<unknown>((accumulator, key) => {
    if (!isObject(accumulator)) {
      return undefined;
    }
    return accumulator[key];
  }, record);
};

export const applyFilters = (
  records: ChildRecord[],
  filters: FilterConfig[] | undefined,
  now: Date,
) => {
  if (!filters || filters.length === 0) {
    return records;
  }
  return records.filter((record) =>
    filters.every((filter) => evaluateFilter(getNestedValue(record, filter.field), filter, now)),
  );
};
