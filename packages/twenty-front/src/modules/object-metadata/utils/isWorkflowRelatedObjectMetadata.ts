import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';

export const isWorkflowRelatedObjectMetadata = (objectNameSingular: string) => {
  return (
    objectNameSingular === CoreObjectNameSingular.Workflow ||
    isWorkflowSubObjectMetadata(objectNameSingular)
  );
};
