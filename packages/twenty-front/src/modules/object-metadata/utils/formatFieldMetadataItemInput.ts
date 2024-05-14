import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatMetadataLabelToMetadataNameOrThrows } from '~/pages/settings/data-model/utils/format-metadata-label-to-name.util';

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
    name: label ? formatMetadataLabelToMetadataNameOrThrows(label) : undefined,
    options: input.options,
  };
};
