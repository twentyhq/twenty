import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

export const isFieldMetadataItemAvailableAsListDateField = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.isActive === true &&
  isFieldMetadataDateKind(fieldMetadataItem.type);
