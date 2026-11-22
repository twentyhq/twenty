import { isFormulaFieldMetadataItem } from '@/object-metadata/utils/isFormulaFieldMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  isFieldMetadataDateKind,
  isFieldMetadataSupportedInGroupBy,
} from 'twenty-shared/utils';

export const isFieldMetadataItemAvailableAsCalendarField = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.isActive === true &&
  !isFormulaFieldMetadataItem(fieldMetadataItem) &&
  isFieldMetadataDateKind(fieldMetadataItem.type) &&
  isFieldMetadataSupportedInGroupBy({
    type: fieldMetadataItem.type,
    name: fieldMetadataItem.name,
    isSystem: fieldMetadataItem.isSystem ?? false,
  });
