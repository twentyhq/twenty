import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES } from '@/settings/data-model/constants/CompositeFieldSubFieldLabelMessages';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getRelationConnectSubFieldLabel = (
  fieldMetadataItem: FieldMetadataItem,
  uniqueFieldMetadataItem: FieldMetadataItem,
  compositeSubFieldKey?: string,
) => {
  const compositeSubFieldLabelMessage =
    isCompositeFieldType(uniqueFieldMetadataItem.type) &&
    isDefined(compositeSubFieldKey)
      ? COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES[uniqueFieldMetadataItem.type][
          compositeSubFieldKey
        ]
      : undefined;

  const compositeSubFieldLabel = isDefined(compositeSubFieldLabelMessage)
    ? t(compositeSubFieldLabelMessage)
    : undefined;

  return `${fieldMetadataItem.label} / ${uniqueFieldMetadataItem.label}${compositeSubFieldLabel ? ` / ${compositeSubFieldLabel}` : ''}`;
};
