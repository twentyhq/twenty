import type { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { validateAndTransformValueByFieldType } from './validate-and-transform-value-by-field-type.util';

export const validateAndTransformArrayItems = (
  values: unknown[],
  fieldMetadata: FlatFieldMetadata,
  fieldName: string,
): unknown[] => {
  return values.map((item) => {
    if (item === null) {
      return item;
    }

    return validateAndTransformValueByFieldType(item, fieldMetadata, fieldName);
  });
};
