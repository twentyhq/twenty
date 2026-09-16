import { v5 } from 'uuid';

const MIRRORED_CORE_WORKFLOW_ID_NAMESPACE =
  '6f1d0f0e-1b3a-4d2e-9f6c-6f1d0f0e1b3a';

export const buildMirroredCoreWorkflowId = ({
  workspaceId,
  workspaceWorkflowId,
}: {
  workspaceId: string;
  workspaceWorkflowId: string;
}): string =>
  v5(
    `${workspaceId}:${workspaceWorkflowId}`,
    MIRRORED_CORE_WORKFLOW_ID_NAMESPACE,
  );
