import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const isWorkflowSubObjectMetadata = (
  objectMetadataNameSingular?: string,
) =>
  objectMetadataNameSingular === CoreObjectNameSingular.WorkflowVersion ||
  objectMetadataNameSingular === CoreObjectNameSingular.WorkflowRun;
