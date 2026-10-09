import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMetadataEligibleForRecordForm } from 'twenty-shared/utils';

export const isFieldMetadataItemEligibleForRecordForm = (
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'isActive' | 'isSystem' | 'isUIEditable' | 'settings'
  >,
): boolean =>
  isFieldMetadataEligibleForRecordForm({
    fieldName: fieldMetadataItem.name,
    fieldType: fieldMetadataItem.type,
    isActive: fieldMetadataItem.isActive === true,
    isSystem: fieldMetadataItem.isSystem === true,
    isUIEditable: fieldMetadataItem.isUIEditable !== false,
    relationType: fieldMetadataItem.settings?.relationType,
  });
