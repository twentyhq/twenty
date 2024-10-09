import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isWorkflowSubObject } from '@/object-metadata/utils/isWorkflowSubObject';

export const isFieldReadonlyFromObjectMetadataName = (
  fieldName: string,
  objectMetadataNameSingular?: string,
) => {
  if (!objectMetadataNameSingular) {
    return false;
  }

  return (
    isWorkflowSubObject(objectMetadataNameSingular) ||
    (objectMetadataNameSingular === CoreObjectNameSingular.Workflow &&
      fieldName !== 'name')
  );
};
