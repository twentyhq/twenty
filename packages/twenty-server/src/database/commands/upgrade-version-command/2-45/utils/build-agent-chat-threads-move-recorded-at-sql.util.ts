// When 2.44 moved archived chats to the trash, or NULL if it never ran here
export const buildAgentChatThreadsMoveRecordedAtSql = ({
  workspaceIdParameter,
  migrationNameParameter,
}: {
  workspaceIdParameter: string;
  migrationNameParameter: string;
}) => `
  SELECT min(migration."createdAt")
  FROM core."upgradeMigration" migration
  WHERE migration."workspaceId" = ${workspaceIdParameter}
    AND migration.name = ${migrationNameParameter}
    AND migration.status = 'completed'`;
