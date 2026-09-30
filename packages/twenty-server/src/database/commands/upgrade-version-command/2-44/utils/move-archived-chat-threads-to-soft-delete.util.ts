import { type EntityManager } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Archived conversations enter the trash as of now, not as of their archive
// date, so trash cleanup does not purge old archives on its next run. They
// keep archivedAt so a rollback only takes back the chats this moved, not ones
// deleted through the record API; a chat that was already deleted drops it
export const moveArchivedChatThreadsToSoftDelete = async ({
  manager,
  workspaceId,
  direction,
}: {
  manager: EntityManager;
  workspaceId: string;
  direction: 'up' | 'down';
}): Promise<number> => {
  const table = `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThread"`;

  if (direction === 'down') {
    const [, restoredCount]: [unknown[], number] = await manager.query(
      `UPDATE ${table}
         SET "deletedAt" = NULL
         WHERE "archivedAt" IS NOT NULL AND "deletedAt" IS NOT NULL`,
    );

    return restoredCount;
  }

  await manager.query(
    `UPDATE ${table}
       SET "archivedAt" = NULL
       WHERE "archivedAt" IS NOT NULL AND "deletedAt" IS NOT NULL`,
  );

  const [, movedCount]: [unknown[], number] = await manager.query(
    `UPDATE ${table}
       SET "deletedAt" = NOW()
       WHERE "archivedAt" IS NOT NULL AND "deletedAt" IS NULL`,
  );

  return movedCount;
};
