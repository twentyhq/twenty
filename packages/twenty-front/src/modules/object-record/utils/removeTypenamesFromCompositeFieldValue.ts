import { isDefined } from 'twenty-shared/utils';

// Composite sub-fields typed as objects in the schema come back from Apollo with
// __typename, which composite input types reject
export const removeTypenamesFromCompositeFieldValue = (
  value: unknown,
): unknown => {
  if (Array.isArray(value)) {
    return value.map(removeTypenamesFromCompositeFieldValue);
  }

  if (!isDefined(value) || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== '__typename')
      .map(([key, subValue]) => [
        key,
        removeTypenamesFromCompositeFieldValue(subValue),
      ]),
  );
};
