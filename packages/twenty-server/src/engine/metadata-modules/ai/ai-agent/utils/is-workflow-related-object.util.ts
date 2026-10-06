import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
] as const;

export const isWorkflowRelatedObject = (objectMetadata: {
  universalIdentifier: string;
}): boolean => {
  return WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    objectMetadata.universalIdentifier as (typeof WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
  );
};
