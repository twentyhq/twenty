import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/settings/data-model/constants/CompositeFieldSubFieldLabel';
import { isDefined } from 'twenty-shared/utils';

export const getRelationUpdateSubFieldLabel = (
  fieldMetadataItem: FieldMetadataItem,
  targetFieldMetadataItem: FieldMetadataItem,
  compositeSubFieldKey?: string,
) => {
  const compositeSubFieldLabel =
    isCompositeFieldType(targetFieldMetadataItem.type) &&
    isDefined(compositeSubFieldKey)
      ? COMPOSITE_FIELD_SUB_FIELD_LABELS[targetFieldMetadataItem.type][
          compositeSubFieldKey
        ]
      : undefined;

  return `${fieldMetadataItem.label} / ${targetFieldMetadataItem.label}${compositeSubFieldLabel ? ` / ${compositeSubFieldLabel}` : ''}`;
};
