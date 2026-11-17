import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const isWorkflowRelatedObject = (objectMetadata: {
  universalIdentifier: string;
}): boolean =>
  objectMetadata.universalIdentifier ===
  STANDARD_OBJECTS.workflowRun.universalIdentifier;
