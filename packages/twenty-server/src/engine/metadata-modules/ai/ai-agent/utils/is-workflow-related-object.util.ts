import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// All workflow-related standard object IDs that should be filtered out from agent access
const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
  STANDARD_OBJECTS.workflowAutomatedTrigger.universalIdentifier,
] as const;

export const isWorkflowRelatedObject = (objectMetadata: {
  universalIdentifier: string;
}): boolean => {
  return WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    objectMetadata.universalIdentifier as (typeof WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
  );
};
