import {
  isPrefixedCompositeField,
  parseCompositeFieldKey,
} from 'src/engine/api/graphql/workspace-query-builder/utils/composite-field-metadata.util';

export const handleCompositeKey = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): void => {
  const parsedFieldKey = parseCompositeFieldKey(key);

  // If composite field key can't be parsed, return
  if (!parsedFieldKey) {
    return;
  }

  if (!result[parsedFieldKey.parentFieldName]) {
    result[parsedFieldKey.parentFieldName] = {};
  }

  result[parsedFieldKey.parentFieldName][parsedFieldKey.childFieldName] = value;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseResult = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || typeof obj === 'function') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => parseResult(item));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = parseResult(obj[key]);
      } else if (key === '__typename') {
        result[key] = obj[key].replace(/^_*/, '');
      } else if (isPrefixedCompositeField(key)) {
        handleCompositeKey(result, key, obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }

  return result;
};
