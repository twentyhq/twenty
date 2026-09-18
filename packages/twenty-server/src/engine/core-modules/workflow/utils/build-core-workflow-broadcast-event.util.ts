import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from 'twenty-shared/constants';

import { type CoreWorkflowBroadcastOperation } from 'src/engine/core-modules/workflow/types/core-workflow-broadcast-operation.type';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';

export const buildCoreWorkflowBroadcastEvent = ({
  operation,
  coreWorkflowId,
  coreWorkflowVersionId,
}: {
  operation: CoreWorkflowBroadcastOperation;
  coreWorkflowId?: string | null;
  coreWorkflowVersionId?: string | null;
}): WorkspaceBroadcastEvent | null => {
  const isWorkflowVersionEvent = isNonEmptyString(coreWorkflowVersionId);

  const record = isWorkflowVersionEvent
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
    entityName: isWorkflowVersionEvent ? 'workflowVersion' : 'workflow',
    recordId: record.id,
    properties:
      operation === 'deleted' ? { before: record } : { after: record },
    requiredPermissionFlag: PermissionFlagType.WORKFLOWS,
  };
};
