import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  isFieldMetadataDateKind,
  isFieldMetadataSupportedInGroupBy,
} from 'twenty-shared/utils';

// Single availability rule for calendar date fields, shared by the
// record index calendar picker and dashboard widget calendar settings:
// active date fields, excluding system ones like deletedAt.
export const isFieldMetadataItemAvailableAsCalendarField = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.isActive === true &&
  isFieldMetadataDateKind(fieldMetadataItem.type) &&
  isFieldMetadataSupportedInGroupBy({
    type: fieldMetadataItem.type,
    name: fieldMetadataItem.name,
    isSystem: fieldMetadataItem.isSystem ?? false,
  });
