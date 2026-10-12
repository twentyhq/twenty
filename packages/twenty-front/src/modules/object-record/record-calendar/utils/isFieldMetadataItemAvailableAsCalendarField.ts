import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  isFieldMetadataDateKind,
  isFieldMetadataSupportedInGroupBy,
} from 'twenty-shared/utils';

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
