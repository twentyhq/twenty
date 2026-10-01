import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// Copied rather than imported: the backfill must keep writing exactly this set
// whatever the runtime channel sync becomes later.
const EVERYONE_PRINCIPAL_ID = '5047ca8f-514a-4609-8ef4-1bb63f3084c5';

const RECORD_SHARE_COLUMNS = `("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")`;

const CHANNEL_RECORD_SOURCES = [
  {
    channelTableName: 'messageChannel',
    recordObjectUniversalIdentifier:
      STANDARD_OBJECTS.messageThread.universalIdentifier,
    buildChannelRecordsQuery: (schemaName: string) =>
      `SELECT DISTINCT association."messageChannelId" AS "channelId", message."messageThreadId" AS "recordId"
       FROM ${schemaName}."messageChannelMessageAssociation" association
       JOIN ${schemaName}."message" message ON message.id = association."messageId"
       WHERE association."deletedAt" IS NULL
         AND message."messageThreadId" IS NOT NULL`,
  },
  {
    channelTableName: 'calendarChannel',
    recordObjectUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    buildChannelRecordsQuery: (schemaName: string) =>
      `SELECT DISTINCT association."calendarChannelId" AS "channelId", association."calendarEventId" AS "recordId"
       FROM ${schemaName}."calendarChannelEventAssociation" association
       WHERE association."deletedAt" IS NULL`,
  },
] as const;

// Each query takes the workspace id as $1 and is idempotent.
export const buildChannelRecordShareBackfillQueries = (
  schemaName: string,
): string[] =>
  CHANNEL_RECORD_SOURCES.flatMap(
    ({
      channelTableName,
      recordObjectUniversalIdentifier,
      buildChannelRecordsQuery,
    }) => {
      const channelRecords = `(${buildChannelRecordsQuery(schemaName)}) channel_record
        JOIN core."${channelTableName}" channel ON channel.id = channel_record."channelId"
          AND channel."workspaceId" = $1
        JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1
          AND metadata."universalIdentifier" = '${recordObjectUniversalIdentifier}'`;

      return [
        `INSERT INTO ${schemaName}."recordShare" ${RECORD_SHARE_COLUMNS}
         SELECT metadata.id, channel_record."recordId", member.id,
           'WORKSPACE_MEMBER', 'FULL', 'OWNER', channel.id
         FROM ${channelRecords}
         JOIN core."connectedAccount" account ON account.id = channel."connectedAccountId"
         JOIN core."userWorkspace" membership ON membership.id = account."userWorkspaceId"
           AND membership."deletedAt" IS NULL
         JOIN ${schemaName}."workspaceMember" member ON member."userId" = membership."userId"
           AND member."deletedAt" IS NULL
         ON CONFLICT ("objectMetadataId", "recordId", "principalId", "rowCause", "sourceId") DO NOTHING`,
        `INSERT INTO ${schemaName}."recordShare" ${RECORD_SHARE_COLUMNS}
         SELECT metadata.id, channel_record."recordId", application."defaultRoleId",
           'ROLE', 'FULL', 'APPLICATION', channel.id
         FROM ${channelRecords}
         JOIN core."connectedAccount" account ON account.id = channel."connectedAccountId"
         JOIN core."application" application ON application.id = account."applicationId"
           AND application."deletedAt" IS NULL
         WHERE application."defaultRoleId" IS NOT NULL
         ON CONFLICT ("objectMetadataId", "recordId", "principalId", "rowCause", "sourceId") DO NOTHING`,
        `INSERT INTO ${schemaName}."recordShare" ${RECORD_SHARE_COLUMNS}
         SELECT metadata.id, channel_record."recordId", '${EVERYONE_PRINCIPAL_ID}',
           'EVERYONE', 'READ', 'RULE', channel.id
         FROM ${channelRecords}
         WHERE channel.visibility = 'SHARE_EVERYTHING'
         ON CONFLICT ("objectMetadataId", "recordId", "principalId", "rowCause", "sourceId") DO NOTHING`,
      ];
    },
  );
