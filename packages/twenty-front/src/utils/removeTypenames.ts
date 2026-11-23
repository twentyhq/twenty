import { isPlainObject } from 'twenty-shared/utils';

// Values read from the API carry __typename on every object, which GraphQL input types reject
export const removeTypenames = <TValue>(value: TValue): TValue => {
  if (Array.isArray(value)) {
    return value.map(removeTypenames) as TValue;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== '__typename')
      .map(([key, nestedValue]) => [key, removeTypenames(nestedValue)]),
  ) as TValue;
};
