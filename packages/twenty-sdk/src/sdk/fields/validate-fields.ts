import { FieldMetadataType } from 'twenty-shared/types';

import { isNonEmptyString } from '@sniptt/guards';

import { type ObjectFieldManifest } from 'twenty-shared/application';

export const validateFields = (
  fields: ObjectFieldManifest[] | undefined,
): string[] => {
  if (!fields) {
    return [];
  }

  const errors: string[] = [];

  for (const field of fields) {
    if (!isNonEmptyString(field.label)) {
      errors.push('Field must have a label');
    }

    if (!isNonEmptyString(field.name)) {
      errors.push(`Field "${field.label}" must have a name`);
    }

    if (!isNonEmptyString(field.universalIdentifier)) {
      errors.push(`Field "${field.label}" must have a universalIdentifier`);
    }

    if (
      (field.type === FieldMetadataType.SELECT ||
        field.type === FieldMetadataType.MULTI_SELECT) &&
      (!Array.isArray(field.options) || field.options.length === 0)
    ) {
      errors.push(
        `Field "${field.label}" is a SELECT/MULTI_SELECT type and must have options`,
      );
    }
  }

  return errors;
};
