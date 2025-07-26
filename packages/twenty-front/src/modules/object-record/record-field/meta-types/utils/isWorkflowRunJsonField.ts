import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

// FIXME: This is temporary. We'll soon introduce a new display mode for all fields and we'll have to remove this code.
export const isWorkflowRunJsonField = ({
  objectMetadataNameSingular,
  fieldName,
}: {
  fieldName: string | undefined;
  objectMetadataNameSingular: string | undefined;
}) => {
  return (
    objectMetadataNameSingular === CoreObjectNameSingular.WorkflowRun &&
    fieldName === 'state'
  );
};
