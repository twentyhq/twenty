import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  LEGACY_WORKSPACE_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/modules/workflow/common/constants/legacy-workspace-workflow-object-universal-identifiers.constant';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKSPACE_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
] as const;

export const isWorkflowRelatedObject = (objectMetadata: {
  universalIdentifier: string;
}): boolean => {
  return WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    objectMetadata.universalIdentifier as (typeof WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
  );
};
