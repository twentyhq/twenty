import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const isWorkflowSubObject = (objectMetadataNameSingular?: string) =>
  objectMetadataNameSingular === CoreObjectNameSingular.WorkflowVersion ||
  objectMetadataNameSingular === CoreObjectNameSingular.WorkflowRun;
