export const hasCoreWorkflowWorkspaceWorkflowIdColumn = async (
  executeQuery: (query: string) => Promise<unknown[]>,
): Promise<boolean> => {
  const rows = await executeQuery(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'core'
       AND table_name = 'workflow'
       AND column_name = 'workspaceWorkflowId'
     LIMIT 1`,
  );

  return rows.length > 0;
};
