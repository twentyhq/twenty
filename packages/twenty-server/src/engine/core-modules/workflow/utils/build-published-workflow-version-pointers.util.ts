export const buildPublishedWorkflowVersionPointers = ({
  coreWorkflowVersionId,
  workspaceWorkflowVersionId,
}: {
  coreWorkflowVersionId: string;
  workspaceWorkflowVersionId: string | null;
}): {
  lastPublishedCoreWorkflowVersionId: string;
  lastPublishedVersionId: string;
} => ({
  lastPublishedCoreWorkflowVersionId: coreWorkflowVersionId,
  lastPublishedVersionId: workspaceWorkflowVersionId ?? coreWorkflowVersionId,
});
