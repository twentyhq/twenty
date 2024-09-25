import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

export const formatFieldMetadataItemInput = (
  input: Partial<
    Pick<
      FieldMetadataItem,
      | 'type'
      | 'label'
      | 'defaultValue'
      | 'icon'
      | 'description'
      | 'options'
      | 'settings'
    >
  >,
) => {
  const label = input.label?.trim();

  return {
    defaultValue: input.defaultValue,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label,
    name: label ? computeMetadataNameFromLabelOrThrow(label) : undefined,
    options: input.options,
    settings: input.settings,
  };
};
