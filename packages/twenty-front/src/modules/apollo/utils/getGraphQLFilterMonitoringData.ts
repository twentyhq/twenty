const FILTER_OPERATOR_KEYS = new Set([
  'amountMicros',
  'and',
  'containsAny',
  'containsIlike',
  'currencyCode',
  'eq',
  'gt',
  'gte',
  'ilike',
  'in',
  'iregex',
  'is',
  'isEmptyArray',
  'label',
  'like',
  'lt',
  'lte',
  'neq',
  'not',
  'or',
  'primaryEmail',
  'primaryPhoneCallingCode',
  'primaryPhoneNumber',
  'primaryLinkLabel',
  'primaryLinkUrl',
  'regex',
  'search',
  'startsWith',
  'url',
]);

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const hashIdentifier = (value: string): string => {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
};

const getNestedFilterPaths = (
  value: unknown,
  path: string[] = [],
): string[] => {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    if (!isRecord(nestedValue)) {
      return [];
    }

    const nestedPath = [...path, key];
    const nestedKeys = Object.keys(nestedValue);
    const isOperatorFilter = nestedKeys.every((nestedKey) =>
      FILTER_OPERATOR_KEYS.has(nestedKey),
    );

    if (isOperatorFilter) {
      return [];
    }

    return [
      nestedPath.join('.'),
      ...getNestedFilterPaths(nestedValue, nestedPath),
    ];
  });
};

export type GraphQLFilterMonitoringData = {
  filterShape: 'missing' | 'operator-filter' | 'nested-object-filter';
  filterKeyHash: string;
  viewIdHash: string;
};

export const getGraphQLFilterMonitoringData = (
  variables: unknown,
): GraphQLFilterMonitoringData => {
  const filter = isRecord(variables) ? variables.filter : undefined;
  const nestedFilterPaths = getNestedFilterPaths(filter);
  const filterShape = !isRecord(filter)
    ? 'missing'
    : nestedFilterPaths.length > 0
      ? 'nested-object-filter'
      : 'operator-filter';
  const viewId = isRecord(variables) ? variables.viewId : undefined;

  return {
    filterShape,
    filterKeyHash:
      nestedFilterPaths.length > 0
        ? hashIdentifier(nestedFilterPaths.join('|'))
        : 'none',
    viewIdHash: typeof viewId === 'string' ? hashIdentifier(viewId) : 'none',
  };
};
