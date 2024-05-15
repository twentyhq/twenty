import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { METADATA_NAME_VALID_STRING_PATTERN } from '~/pages/settings/data-model/utils/constants.utils';
import { formatLabelOrThrows } from '~/pages/settings/data-model/utils/format-label.util';

export const formatFieldMetadataItemInput = (
  input: Partial<
    Pick<
      FieldMetadataItem,
      'type' | 'label' | 'defaultValue' | 'icon' | 'description' | 'options'
    >
  >,
) => {
  const label = input.label?.trim();

  return {
    defaultValue: input.defaultValue,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label,
    name: label
      ? formatLabelOrThrows(label, METADATA_NAME_VALID_STRING_PATTERN)
      : undefined,
    options: input.options,
  };
};
