import { type EntityManager } from 'typeorm';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Older pods can write legacy-only senders after expansion. The sender contract
// must rerun this backfill under the history fence before dropping the legacy column.
export const backfillChatMessageSenderWorkspaceMembers = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}): Promise<number> => {
  const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  const [, linkedCount]: [unknown[], number] = await manager.query(
    `UPDATE ${schemaName}."agentMessage" message
       SET "senderWorkspaceMemberId" = member.id
       FROM core."userWorkspace" membership
       JOIN ${schemaName}."workspaceMember" member
         ON member."userId" = membership."userId" AND member."deletedAt" IS NULL
       WHERE membership.id = message."senderUserWorkspaceId"
         AND membership."workspaceId" = $1
         AND message."senderWorkspaceMemberId" IS NULL`,
    [workspaceId],
  );

  return linkedCount;
};
