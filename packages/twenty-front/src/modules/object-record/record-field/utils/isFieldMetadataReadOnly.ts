import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

export const isFieldMetadataReadOnly = (fieldMetadata: FieldMetadata) => {
  if (
    fieldMetadata.fieldName === 'noteTargets' ||
    fieldMetadata.fieldName === 'taskTargets'
  ) {
    return true;
  }

  return (
    isWorkflowSubObjectMetadata(fieldMetadata.objectMetadataNameSingular) ||
    (fieldMetadata.objectMetadataNameSingular ===
      CoreObjectNameSingular.Workflow &&
      fieldMetadata.fieldName !== 'name')
  );
};
