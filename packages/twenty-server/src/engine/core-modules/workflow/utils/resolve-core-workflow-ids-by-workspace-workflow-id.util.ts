import { isNonEmptyString } from '@sniptt/guards';

import { hasCoreWorkflowWorkspaceWorkflowIdColumn } from 'src/engine/core-modules/workflow/utils/has-core-workflow-workspace-workflow-id-column.util';

type CoreWorkflowReverseRow = {
  workspaceWorkflowId: string;
  id: string;
};

export const resolveCoreWorkflowIdsByWorkspaceWorkflowId = async ({
  executeQuery,
  workspaceId,
  workspaceWorkflowIds,
}: {
  executeQuery: (
    query: string,
    parameters?: unknown[],
  ) => Promise<CoreWorkflowReverseRow[]>;
  workspaceId: string;
  workspaceWorkflowIds: string[];
}): Promise<Map<string, string>> => {
  const coreWorkflowIdByWorkspaceWorkflowId = new Map<string, string>();

  if (workspaceWorkflowIds.length === 0) {
    return coreWorkflowIdByWorkspaceWorkflowId;
  }

  if (!(await hasCoreWorkflowWorkspaceWorkflowIdColumn(executeQuery))) {
    return coreWorkflowIdByWorkspaceWorkflowId;
  }

  const reverseMappedCoreWorkflows = await executeQuery(
    `SELECT DISTINCT ON ("workspaceWorkflowId") "workspaceWorkflowId", "id"
     FROM core."workflow"
     WHERE "workspaceId" = $1 AND "workspaceWorkflowId" = ANY($2::uuid[])
     ORDER BY "workspaceWorkflowId", "createdAt" ASC, "id" ASC`,
    [workspaceId, workspaceWorkflowIds],
  );

  for (const coreWorkflow of reverseMappedCoreWorkflows) {
    if (isNonEmptyString(coreWorkflow.workspaceWorkflowId)) {
      coreWorkflowIdByWorkspaceWorkflowId.set(
        coreWorkflow.workspaceWorkflowId,
        coreWorkflow.id,
      );
    }
  }

  return coreWorkflowIdByWorkspaceWorkflowId;
};
