import { type QueryRunner } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const assertNoAgentChatThreadTargets = async (
  runner: QueryRunner,
  workspaceId: string,
): Promise<void> => {
  const table = `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThreadTarget"`;
  const [{ exists }]: { exists: boolean }[] = await runner.query(
    'SELECT to_regclass($1) IS NOT NULL AS exists',
    [table],
  );
  if (!exists) return;
  const targets: { id: string }[] = await runner.query(
    `SELECT id FROM ${table} WHERE "deletedAt" IS NULL LIMIT 1`,
  );
  if (targets.length > 0) {
    throw new Error(
      'Detach record links before rolling agent history back to core; core storage cannot preserve workspace thread targets',
    );
  }
};
