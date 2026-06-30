import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

// TODO: Refactor with composite filters
export const getAdvancedFilterInputPlaceholderText = (
  fieldMetadataItem: FieldMetadataItem,
) => {
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
      return `Enter value for ${fieldMetadataItem.label}`;
    case FieldMetadataType.NUMBER:
      return 'Enter number';
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
      return 'Enter date';
    case FieldMetadataType.ACTOR:
      return 'Select actor';
    case FieldMetadataType.RELATION:
      return `Select ${fieldMetadataItem.relation?.targetObjectMetadata.nameSingular}`;
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return `Select ${fieldMetadataItem.label}`;

    default:
      return 'Enter value';
  }
};
