/**
 * Composite key are structured as follows:
 * COMPOSITE___{parentFieldName}_{childFieldName}
 * This util are here to pre-process and post-process the composite keys before and after querying the database
 */

export const compositeFieldPrefix = 'COMPOSITE___';

export const createCompositeFieldKey = (
  fieldName: string,
  propertyName: string,
): string => {
  return `${compositeFieldPrefix}${fieldName}_${propertyName}`;
};

export const isPrefixedCompositeField = (key: string): boolean => {
  return key.startsWith(compositeFieldPrefix);
};

export const parseCompositeFieldKey = (
  key: string,
): {
  parentFieldName: string;
  childFieldName: string;
} | null => {
  const [parentFieldName, childFieldName] = key
    .replace(compositeFieldPrefix, '')
    .split('_');

  if (!parentFieldName || !childFieldName) {
    return null;
  }

  return {
    parentFieldName,
    childFieldName,
  };
};
