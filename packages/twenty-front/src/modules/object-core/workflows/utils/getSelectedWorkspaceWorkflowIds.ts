import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';

export const getSelectedWorkspaceWorkflowIds = ({
  coreWorkflows,
  selectedRowIds,
}: {
  coreWorkflows: Pick<CoreWorkflow, 'id' | 'workspaceWorkflowId'>[];
  selectedRowIds: string[];
}) =>
  coreWorkflows
    .filter((coreWorkflow) => selectedRowIds.includes(coreWorkflow.id))
    .map((coreWorkflow) => coreWorkflow.workspaceWorkflowId)
    .filter(isDefined);
