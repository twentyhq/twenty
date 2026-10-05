export const hasCoreWorkflowWorkspaceVersionIdColumn = async (
  executeQuery: (query: string) => Promise<unknown[]>,
): Promise<boolean> => {
  const rows = await executeQuery(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'core' AND table_name = 'workflowVersion'
       AND column_name = 'workspaceWorkflowVersionId'`,
  );

  return rows.length > 0;
};
