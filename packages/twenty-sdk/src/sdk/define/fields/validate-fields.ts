import { FieldMetadataType } from 'twenty-shared/types';

import { isNonEmptyString } from '@sniptt/guards';

import { type ObjectFieldManifest } from 'twenty-shared/application';
import { TAG_COLORS } from 'twenty-shared/constants';
import {
  isDefined,
  isFieldMetadataSelectKind,
  isPlainObject,
  isTagColor,
} from 'twenty-shared/utils';

const getSelectOptionErrors = (field: ObjectFieldManifest): string[] => {
  if (!isFieldMetadataSelectKind(field.type) || !Array.isArray(field.options)) {
    return [];
  }

  return field.options.flatMap((option, index) => {
    if (!isPlainObject(option)) {
      return [
        `Field "${field.label}" option at index ${index} must be an object`,
      ];
    }

    if (!isDefined(option.color) || isTagColor(option.color)) {
      return [];
    }

    return [
      `Field "${field.label}" option "${option.label}" has an unsupported color. Supported colors: ${TAG_COLORS.join(', ')}`,
    ];
  });
};

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

    errors.push(...getSelectOptionErrors(field));

    if (
      field.isUnique === true &&
      (field.type === FieldMetadataType.RELATION ||
        field.type === FieldMetadataType.MORPH_RELATION ||
        field.type === FieldMetadataType.FILES)
    ) {
      errors.push(
        `Field "${field.label}" of type ${field.type} cannot be unique`,
      );
    }
  }

  return errors;
};
