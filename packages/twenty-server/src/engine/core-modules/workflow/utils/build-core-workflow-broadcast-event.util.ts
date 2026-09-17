import { isNonEmptyString } from '@sniptt/guards';

import { type CoreWorkflowBroadcastOperation } from 'src/engine/core-modules/workflow/types/core-workflow-broadcast-operation.type';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';

export const buildCoreWorkflowBroadcastEvent = ({
  operation,
  coreWorkflowId,
  coreWorkflowVersionId,
  recipientUserWorkspaceIds,
}: {
  operation: CoreWorkflowBroadcastOperation;
  coreWorkflowId?: string | null;
  coreWorkflowVersionId?: string | null;
  recipientUserWorkspaceIds: string[];
}): WorkspaceBroadcastEvent | null => {
  const record = isNonEmptyString(coreWorkflowVersionId)
    ? {
        id: coreWorkflowVersionId,
        ...(isNonEmptyString(coreWorkflowId) ? { coreWorkflowId } : {}),
      }
    : isNonEmptyString(coreWorkflowId)
      ? { id: coreWorkflowId }
      : null;

  if (record === null) {
    return null;
  }

  return {
    type: operation,
    entityName: isNonEmptyString(coreWorkflowVersionId)
      ? 'coreWorkflowVersion'
      : 'coreWorkflow',
    recordId: record.id,
    properties:
      operation === 'deleted' ? { before: record } : { after: record },
    recipientUserWorkspaceIds,
  };
};
