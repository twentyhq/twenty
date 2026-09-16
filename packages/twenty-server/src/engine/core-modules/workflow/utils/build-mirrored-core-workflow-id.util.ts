import { v5 } from 'uuid';

const MIRRORED_CORE_WORKFLOW_ID_NAMESPACE =
  '6f1d0f0e-1b3a-4d2e-9f6c-6f1d0f0e1b3a';

// Both the version mirror and the workflow create listener can be the first to
// notice that a workspace workflow has no core row. Deriving the id from the
// workspace workflow makes them mint the same one, so the second writer upserts
// onto the first row instead of creating a competing parent.
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
