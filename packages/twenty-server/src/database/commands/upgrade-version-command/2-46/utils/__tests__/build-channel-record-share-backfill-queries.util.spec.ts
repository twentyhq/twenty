import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  buildChannelRecordShareBackfillQueries,
  CHANNEL_RECORD_SHARE_BACKFILL_SOURCES,
} from 'src/database/commands/upgrade-version-command/2-46/utils/build-channel-record-share-backfill-queries.util';

const ON_CONFLICT_DO_NOTHING =
  'ON CONFLICT ("objectMetadataId", "recordId", "principalId", "rowCause", "sourceId") DO NOTHING';

describe('buildChannelRecordShareBackfillQueries', () => {
  it('grants message threads and calendar events', () => {
    expect(
      CHANNEL_RECORD_SHARE_BACKFILL_SOURCES.map(
        ({ channelTableName, recordObjectUniversalIdentifier }) => [
          channelTableName,
          recordObjectUniversalIdentifier,
        ],
      ),
    ).toEqual([
      ['messageChannel', STANDARD_OBJECTS.messageThread.universalIdentifier],
      ['calendarChannel', STANDARD_OBJECTS.calendarEvent.universalIdentifier],
    ]);
  });

  it.each(CHANNEL_RECORD_SHARE_BACKFILL_SOURCES)(
    'writes the owner, application and rule grants of one $channelTableName',
    (source) => {
      const queries = buildChannelRecordShareBackfillQueries({
        schemaName: '"workspace_schema"',
        source,
      });

      expect(queries).toHaveLength(3);

      for (const query of queries) {
        expect(query).toContain(
          'INSERT INTO "workspace_schema"."recordShare" ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")',
        );
        expect(query).toContain(ON_CONFLICT_DO_NOTHING);
        expect(query).toContain(
          `JOIN core."${source.channelTableName}" channel ON channel.id = channel_record."channelId"`,
        );
        expect(query).toContain('AND channel."workspaceId" = $1');
        expect(query).toContain(`Id" = $2`);
        expect(query).toContain(
          `metadata."universalIdentifier" = '${source.recordObjectUniversalIdentifier}'`,
        );
      }

      expect(queries[0]).toContain(
        "'WORKSPACE_MEMBER', 'FULL', 'OWNER', channel.id",
      );
      expect(queries[1]).toContain("'ROLE', 'FULL', 'APPLICATION', channel.id");
      expect(queries[2]).toContain("'EVERYONE', 'READ', 'RULE', channel.id");
      expect(queries[2]).toContain("channel.visibility = 'SHARE_EVERYTHING'");
    },
  );
});
