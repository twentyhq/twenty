import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const getRelationConnectSubFieldLabel = (
  fieldMetadataItem: FieldMetadataItem,
  uniqueFieldMetadataItem: FieldMetadataItem,
  compositeSubFieldKey?: string,
) => {
  const compositeSubFieldLabel =
    isCompositeFieldType(uniqueFieldMetadataItem.type) &&
    isDefined(compositeSubFieldKey)
      ? Object.entries(
          COMPOSITE_FIELD_SUB_FIELD_LABELS[uniqueFieldMetadataItem.type],
        ).find(
          ([labelledSubFieldName]) =>
            labelledSubFieldName === compositeSubFieldKey,
        )?.[1]
      : undefined;

  return `${fieldMetadataItem.label} / ${uniqueFieldMetadataItem.label}${compositeSubFieldLabel ? ` / ${compositeSubFieldLabel}` : ''}`;
};
