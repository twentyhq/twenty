import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';

export const isFieldMetadataItemAvailable = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.type !== 'UUID' &&
  !(
    fieldMetadataItem.type === 'RELATION' &&
    parseFieldRelationType(fieldMetadataItem) !== 'TO_ONE_OBJECT'
  ) &&
  !fieldMetadataItem.isSystem &&
  !!fieldMetadataItem.isActive;
