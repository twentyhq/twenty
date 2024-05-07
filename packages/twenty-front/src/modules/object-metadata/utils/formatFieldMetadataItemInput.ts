import toSnakeCase from 'lodash.snakecase';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getDefaultValueForBackend } from '@/object-metadata/utils/getDefaultValueForBackend';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { formatMetadataLabelToMetadataNameOrThrows } from '~/pages/settings/data-model/utils/format-metadata-label-to-name.util';
import { isDefined } from '~/utils/isDefined';

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
  input: Partial<
    Pick<
      FieldMetadataItem,
      'type' | 'label' | 'defaultValue' | 'icon' | 'description'
    >
  > & { options?: FieldMetadataOption[] },
) => {
  const options = input.options as FieldMetadataOption[] | undefined;
  let defaultValue = input.defaultValue;
  if (input.type === FieldMetadataType.MultiSelect) {
    defaultValue = options
      ?.filter((option) => option.isDefault)
      ?.map((defaultOption) => getOptionValueFromLabel(defaultOption.label));
  }
  if (input.type === FieldMetadataType.Select) {
    const defaultOption = options?.find((option) => option.isDefault);
    defaultValue = isDefined(defaultOption)
      ? getOptionValueFromLabel(defaultOption.label)
      : undefined;
  }

  // Check if options has unique values
  if (options !== undefined) {
    // Compute the values based on the label
    const values = options.map((option) =>
      getOptionValueFromLabel(option.label),
    );

    if (new Set(values).size !== options.length) {
      throw new Error(
        `Options must have unique values, but contains the following duplicates ${values.join(
          ', ',
        )}`,
      );
    }
  }

  const label = input.label?.trim();

  return {
    defaultValue:
      isDefined(defaultValue) && input.type
        ? getDefaultValueForBackend(defaultValue, input.type)
        : undefined,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label,
    name: label ? formatMetadataLabelToMetadataNameOrThrows(label) : undefined,
    options: options?.map((option, index) => ({
      color: option.color,
      id: option.id,
      label: option.label.trim(),
      position: index,
      value: getOptionValueFromLabel(option.label),
    })),
  };
};
