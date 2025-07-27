import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/settings/data-model/constants/CompositeFieldSubFieldLabel';
import { isDefined } from 'twenty-shared/utils';

export const getRelationConnectSubFieldLabel = (
  fieldMetadataItem: FieldMetadataItem,
  uniqueFieldMetadataItem: FieldMetadataItem,
  compositeSubFieldKey?: string,
) => {
  const compositeSubFieldLabel =
    isCompositeFieldType(fieldMetadataItem.type) &&
    isDefined(compositeSubFieldKey)
      ? COMPOSITE_FIELD_SUB_FIELD_LABELS[fieldMetadataItem.type][
          compositeSubFieldKey
        ]
      : undefined;

  return `${fieldMetadataItem.label} / ${uniqueFieldMetadataItem.label}${compositeSubFieldLabel ? ` / ${compositeSubFieldLabel}` : ''}`;
};
