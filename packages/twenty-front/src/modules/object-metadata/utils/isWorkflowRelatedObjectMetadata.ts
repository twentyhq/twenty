import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';
import { CoreObjectNameSingular } from '../types/CoreObjectNameSingular';

export const isWorkflowRelatedObjectMetadata = (objectNameSingular: string) => {
  return (
    objectNameSingular === CoreObjectNameSingular.Workflow ||
    isWorkflowSubObjectMetadata(objectNameSingular)
  );
};
