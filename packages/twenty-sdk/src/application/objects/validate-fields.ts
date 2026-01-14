import { FieldMetadataType } from 'twenty-shared/types';
import {
  type FieldManifest,
  type RelationFieldManifest,
} from 'twenty-shared/application';
import { isNonEmptyString } from '@sniptt/guards';

/**
 * Validates an array of fields and throws an error if any field is invalid.
 * This validation is shared between defineObject and extendObject.
 */
export const validateFieldsOrThrow = (
  fields: (FieldManifest | RelationFieldManifest)[] | undefined,
): void => {
  if (!fields) {
    return;
  }

  for (const field of fields) {
    if (!isNonEmptyString(field.label)) {
      throw new Error('Field must have a label');
    }

    if (!isNonEmptyString(field.name)) {
      throw new Error(`Field "${field.label}" must have a name`);
    }

    if (!isNonEmptyString(field.universalIdentifier)) {
      throw new Error(`Field "${field.label}" must have a universalIdentifier`);
    }

    if (
      (field.type === FieldMetadataType.SELECT ||
        field.type === FieldMetadataType.MULTI_SELECT) &&
      (!Array.isArray(field.options) || field.options.length === 0)
    ) {
      throw new Error(
        `Field "${field.label}" is a SELECT/MULTI_SELECT type and must have options`,
      );
    }
  }
};
