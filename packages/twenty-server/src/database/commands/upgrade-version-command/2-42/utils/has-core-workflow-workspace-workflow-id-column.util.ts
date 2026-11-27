// Cached only once true: the column is added mid-upgrade, so a false answer has
// to stay re-checkable, while a true answer can never become false again.
let hasColumn = false;

export const hasCoreWorkflowWorkspaceWorkflowIdColumn = async (
  executeQuery: (query: string) => Promise<unknown[]>,
): Promise<boolean> => {
  if (hasColumn) {
    return true;
  }

  const rows = await executeQuery(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'core'
       AND table_name = 'workflow'
       AND column_name = 'workspaceWorkflowId'
     LIMIT 1`,
  );

  hasColumn = rows.length > 0;

  return hasColumn;
};
