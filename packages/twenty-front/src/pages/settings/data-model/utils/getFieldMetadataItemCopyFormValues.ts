import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { normalizeSelectOptions } from '@/settings/data-model/fields/forms/select/utils/normalizeSelectOptions';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { DEFAULT_ICONS_BY_FIELD_TYPE } from '~/pages/settings/data-model/constants/DefaultIconsByFieldType';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabel';
import { getFieldMetadataItemInitialValues } from '~/pages/settings/data-model/utils/getFieldMetadataItemInitialValues';

export const getFieldMetadataItemCopyFormValues = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  const { settings, defaultValue } =
    getFieldMetadataItemInitialValues(fieldMetadataItem);
  const isLabelSyncedWithName = fieldMetadataItem.isLabelSyncedWithName ?? true;

  return {
    type: fieldMetadataItem.type,
    icon:
      fieldMetadataItem.icon ??
      DEFAULT_ICONS_BY_FIELD_TYPE[fieldMetadataItem.type],
    label: fieldMetadataItem.label,
    name: isLabelSyncedWithName
      ? computeMetadataNameFromLabel(fieldMetadataItem.label)
      : fieldMetadataItem.name,
    isLabelSyncedWithName,
    description: fieldMetadataItem.description ?? undefined,
    settings,
    defaultValue,
    isUnique: fieldMetadataItem.isUnique ?? false,
    options: isNonEmptyArray(fieldMetadataItem.options)
      ? normalizeSelectOptions(fieldMetadataItem.options).map((option) => ({
          ...option,
          id: v4(),
        }))
      : undefined,
  };
};
