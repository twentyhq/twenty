import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeMetadataDefaultValue } from '~/pages/settings/data-model/utils/compute-metadata-defaultValue-utils';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

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
    defaultValue: computeMetadataDefaultValue(input.defaultValue),
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label,
    name: label ? computeMetadataNameFromLabel(label) : undefined,
    options: input.options,
    settings: input.settings,
  };
};
