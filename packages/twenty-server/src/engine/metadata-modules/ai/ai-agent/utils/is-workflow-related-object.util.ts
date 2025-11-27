import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

// All workflow-related standard object IDs that should be filtered out from agent access
const WORKFLOW_STANDARD_OBJECT_IDS = [
  STANDARD_OBJECT_IDS.workflow,
  STANDARD_OBJECT_IDS.workflowRun,
  STANDARD_OBJECT_IDS.workflowVersion,
  STANDARD_OBJECT_IDS.workflowAutomatedTrigger,
] as const;

export const isWorkflowRelatedObject = (objectMetadata: {
  standardId: string | null;
}): boolean => {
  return (
    objectMetadata.standardId !== null &&
    WORKFLOW_STANDARD_OBJECT_IDS.includes(
      objectMetadata.standardId as (typeof WORKFLOW_STANDARD_OBJECT_IDS)[number],
    )
  );
};
