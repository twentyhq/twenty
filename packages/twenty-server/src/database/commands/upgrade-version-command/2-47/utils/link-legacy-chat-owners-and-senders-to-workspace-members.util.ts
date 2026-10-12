import { type DataSource } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Same links the 2.43 and 2.44 backfills made, for rows written by older pods
// since, while the membership columns they link from still exist
export const linkLegacyChatOwnersAndSendersToWorkspaceMembers = async ({
  dataSource,
  workspaceId,
  hasThreadOwner,
  hasMessageSender,
}: {
  dataSource: DataSource;
  workspaceId: string;
  hasThreadOwner: boolean;
  hasMessageSender: boolean;
}): Promise<void> => {
  const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  if (hasThreadOwner) {
    await dataSource.query(
      `UPDATE ${schemaName}."agentChatThread" thread
       SET "workspaceMemberId" = member.id
       FROM core."userWorkspace" membership
       JOIN ${schemaName}."workspaceMember" member
         ON member."userId" = membership."userId" AND member."deletedAt" IS NULL
       WHERE membership.id = thread."userWorkspaceId"
         AND membership."workspaceId" = $1
         AND thread."workspaceMemberId" IS NULL`,
      [workspaceId],
    );
  }

  if (hasMessageSender) {
    await dataSource.query(
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
  }
};
