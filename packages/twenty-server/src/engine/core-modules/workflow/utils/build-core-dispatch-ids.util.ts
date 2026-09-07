import { isDefined } from 'twenty-shared/utils';

import { type CoreDispatchIds } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';

export const buildCoreDispatchIds = ({
  coreWorkflowVersionId,
  workspaceWorkflowVersionId,
}: {
  coreWorkflowVersionId?: string | null;
  workspaceWorkflowVersionId?: string | null;
}): CoreDispatchIds =>
  isDefined(coreWorkflowVersionId) && isDefined(workspaceWorkflowVersionId)
    ? { coreWorkflowVersionId, workspaceWorkflowVersionId }
    : { coreWorkflowVersionId: null, workspaceWorkflowVersionId: null };
