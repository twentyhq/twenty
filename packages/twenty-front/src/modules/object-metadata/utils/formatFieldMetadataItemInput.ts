import toCamelCase from 'lodash.camelcase';
import toSnakeCase from 'lodash.snakecase';

import { Field } from '~/generated-metadata/graphql';

import { FieldMetadataOption } from '../types/FieldMetadataOption';

export const getOptionValueFromLabel = (label: string) => {
  // Remove accents
  const unaccentedLabel = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  // Remove special characters
  const noSpecialCharactersLabel = unaccentedLabel.replace(
    /[^a-zA-Z0-9 ]/g,
    '',
  );

  return toSnakeCase(noSpecialCharactersLabel).toUpperCase();
};

export const formatFieldMetadataItemInput = (
  input: Pick<Field, 'label' | 'icon' | 'description' | 'defaultValue'> & {
    options?: FieldMetadataOption[];
  },
) => {
  const defaultOption = input.options?.find((option) => option.isDefault);

  return {
    defaultValue: defaultOption
      ? getOptionValueFromLabel(defaultOption.label)
      : undefined,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label: input.label.trim(),
    name: toCamelCase(input.label.trim()),
    options: input.options?.map((option, index) => ({
      color: option.color,
      id: option.id,
      label: option.label.trim(),
      position: index,
      value: getOptionValueFromLabel(option.label),
    })),
  };
};
