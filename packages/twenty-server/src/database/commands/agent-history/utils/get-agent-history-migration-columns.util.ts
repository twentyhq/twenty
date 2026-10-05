import { type QueryRunner } from 'typeorm';

import { type AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';

export const getAgentHistoryMigrationColumns = async ({
  runner,
  table,
}: {
  runner: QueryRunner;
  table: (typeof AGENT_HISTORY_TABLES)[number];
}): Promise<readonly string[]> => {
  if (table.name !== 'agentMessage') {
    return table.columns;
  }

  // The 2.42 history move can run before the 2.43 sender-column expansion.
  const columns: { column_name: string }[] = await runner.query(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
    ['core', table.name],
  );
  const existing = new Set(columns.map(({ column_name }) => column_name));

  return table.columns.filter(
    (column) =>
      !['senderUserWorkspaceId', 'senderApplicationId'].includes(column) ||
      existing.has(column),
  );
};
