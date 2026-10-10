import { t } from '@lingui/core/macro';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

// TODO: Refactor with composite filters
export const getAdvancedFilterInputPlaceholderText = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  const fieldLabel = fieldMetadataItem.label;
  const targetObjectNameSingular =
    fieldMetadataItem.relation?.targetObjectMetadata.nameSingular ?? '';

  switch (fieldMetadataItem.type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.ADDRESS:
    case FieldMetadataType.LINKS:
    case FieldMetadataType.EMAILS:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.RATING:
    case FieldMetadataType.PHONES:
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.FULL_NAME:
      return t`Enter value for ${fieldLabel}`;
    case FieldMetadataType.NUMBER:
      return t`Enter number`;
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
      return t`Enter date`;
    case FieldMetadataType.ACTOR:
      return t`Select actor`;
    case FieldMetadataType.RELATION:
      return t`Select ${targetObjectNameSingular}`;
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return t`Select ${fieldLabel}`;

    default:
      return t`Enter value`;
  }
};
