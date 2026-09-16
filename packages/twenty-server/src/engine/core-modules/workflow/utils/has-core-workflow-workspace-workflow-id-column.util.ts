// The column is only added by a 2.41 instance command, and the upgrade sequence
// replays older versions' workspace commands before reaching it, so the mirror
// writers must tolerate its absence instead of failing the upgrade.
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
