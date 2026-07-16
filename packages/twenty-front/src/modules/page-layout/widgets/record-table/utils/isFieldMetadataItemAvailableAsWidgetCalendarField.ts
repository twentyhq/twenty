import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  isFieldMetadataDateKind,
  isFieldMetadataSupportedInGroupBy,
} from 'twenty-shared/utils';

// Mirrors useGetAvailableFieldsForCalendar so widget calendar settings
// offer the same date fields as the record index calendar view picker
// (excluding system fields like deletedAt).
export const isFieldMetadataItemAvailableAsWidgetCalendarField = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.isActive === true &&
  isFieldMetadataDateKind(fieldMetadataItem.type) &&
  isFieldMetadataSupportedInGroupBy({
    type: fieldMetadataItem.type,
    name: fieldMetadataItem.name,
    isSystem: fieldMetadataItem.isSystem ?? false,
  });
