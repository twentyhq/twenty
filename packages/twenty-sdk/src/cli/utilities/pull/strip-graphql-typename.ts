const GRAPHQL_TYPENAME_KEY = '__typename';

export const stripGraphqlTypename = <TValue>(value: TValue): TValue => {
  if (Array.isArray(value)) {
    return value.map(stripGraphqlTypename) as TValue;
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== GRAPHQL_TYPENAME_KEY)
      .map(([key, entry]) => [key, stripGraphqlTypename(entry)]),
  ) as TValue;
};
