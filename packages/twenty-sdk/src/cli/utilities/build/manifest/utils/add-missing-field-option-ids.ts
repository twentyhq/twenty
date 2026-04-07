import type {
  FieldManifest,
  ObjectFieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

export const addMissingFieldOptionIds = <
  T extends FieldManifest | ObjectFieldManifest,
>(
  fieldManifest: T,
): T => {
  if (
    fieldManifest.type !== FieldMetadataType.SELECT &&
    fieldManifest.type !== FieldMetadataType.MULTI_SELECT
  ) {
    return fieldManifest;
  }

  if (fieldManifest.options === undefined || fieldManifest.options === null) {
    return fieldManifest;
  }

  return {
    ...fieldManifest,
    options: fieldManifest.options.map((option) => ({
      ...option,
      id: option.id ?? v4(),
    })),
  };
};
