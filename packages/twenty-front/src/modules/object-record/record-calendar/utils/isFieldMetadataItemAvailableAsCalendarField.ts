import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  isFieldMetadataDateKind,
  isFieldMetadataSupportedInGroupBy,
  isFormulaFieldMetadata,
} from 'twenty-shared/utils';

// Moving a card on the calendar writes the date, which a formula cannot take
export const isFieldMetadataItemAvailableAsCalendarField = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.isActive === true &&
  isFieldMetadataDateKind(fieldMetadataItem.type) &&
  !isFormulaFieldMetadata(fieldMetadataItem) &&
  isFieldMetadataSupportedInGroupBy({
    type: fieldMetadataItem.type,
    name: fieldMetadataItem.name,
    isSystem: fieldMetadataItem.isSystem ?? false,
  });
