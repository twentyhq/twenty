import { type EntityManager } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Archived conversations enter the trash as of now, not as of their archive
// date, so trash cleanup does not purge old archives on its next run
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
  const [, movedCount]: [unknown[], number] = await manager.query(
    direction === 'up'
      ? `UPDATE ${table}
           SET "deletedAt" = COALESCE("deletedAt", NOW()), "archivedAt" = NULL
           WHERE "archivedAt" IS NOT NULL`
      : `UPDATE ${table}
           SET "archivedAt" = "deletedAt", "deletedAt" = NULL
           WHERE "deletedAt" IS NOT NULL`,
  );

  return movedCount;
};
