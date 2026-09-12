import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';

export const getDeletableSelectedCoreWorkflows = ({
  coreWorkflows,
  selectedRowIds,
}: {
  coreWorkflows: Pick<CoreWorkflow, 'id' | 'workspaceWorkflowId'>[];
  selectedRowIds: string[];
}) =>
  coreWorkflows
    .filter((coreWorkflow) => selectedRowIds.includes(coreWorkflow.id))
    .flatMap((coreWorkflow) =>
      isDefined(coreWorkflow.workspaceWorkflowId)
        ? [
            {
              coreWorkflowId: coreWorkflow.id,
              workspaceWorkflowId: coreWorkflow.workspaceWorkflowId,
            },
          ]
        : [],
    );
