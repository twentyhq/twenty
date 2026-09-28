import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const getCompositeSubFieldKey = (
  fieldMetadataItem: FieldMetadataItem,
  subFieldName: string,
) => {
  if (!isCompositeFieldType(fieldMetadataItem.type)) {
    throw new Error(
      `getCompositeSubFieldKey can only be called for composite field types. Received: ${fieldMetadataItem.type}`,
    );
  }

  const subFieldLabel = Object.entries(
    COMPOSITE_FIELD_SUB_FIELD_LABELS[fieldMetadataItem.type],
  ).find(
    ([labelledSubFieldName]) => labelledSubFieldName === subFieldName,
  )?.[1];

  if (!isDefined(subFieldLabel)) {
    throw new Error(
      `getCompositeSubFieldKey received an unknown sub-field. Received: ${subFieldName} for field type ${fieldMetadataItem.type}`,
    );
  }

  return `${subFieldLabel} (${fieldMetadataItem.name})`;
};
