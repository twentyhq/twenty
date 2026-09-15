import { buildMessageCalendarTargetBackfillQueries } from 'src/database/commands/upgrade-version-command/2-37/utils/build-message-calendar-target-backfill-queries.util';

describe('buildMessageCalendarTargetBackfillQueries', () => {
  const queries = buildMessageCalendarTargetBackfillQueries({
    batchSize: 5_000,
    schemaName: 'workspace_test',
  });

  it('builds one event-free raw insert for every parent and target type', () => {
    expect(queries).toHaveLength(6);
    expect(queries.map(({ label }) => label)).toEqual([
      'calendar event person targets',
      'calendar event company targets',
      'calendar event opportunity targets',
      'message thread person targets',
      'message thread company targets',
      'message thread opportunity targets',
    ]);
  });

  it.each(queries)('makes $label restartable and bounded', ({ insertSql }) => {
    expect(insertSql).toContain('NOT EXISTS');
    expect(insertSql).toContain('LIMIT 5000');
    expect(insertSql).toContain('ON CONFLICT DO NOTHING');
    expect(insertSql).toContain('AS "candidateCount"');
    expect(insertSql).toContain('AS "insertedCount"');
    expect(insertSql).toContain('TRUE, FALSE');
    expect(insertSql).not.toContain('messageParticipantTarget');
  });

  it('quotes the workspace schema in every query', () => {
    for (const { countSql, insertSql } of queries) {
      expect(countSql).toContain('"workspace_test"');
      expect(insertSql).toContain('"workspace_test"');
    }
  });

  it.each(queries)(
    'excludes soft-deleted source records from $label',
    ({ label, insertSql }) => {
      expect(insertSql).toContain('participant."deletedAt" IS NULL');
      expect(insertSql).toContain('person."deletedAt" IS NULL');

      if (label.startsWith('calendar event')) {
        expect(insertSql).toContain('calendar_event."deletedAt" IS NULL');
      } else {
        expect(insertSql).toContain('message."deletedAt" IS NULL');
        expect(insertSql).toContain('message_thread."deletedAt" IS NULL');
      }

      if (label.includes('company')) {
        expect(insertSql).toContain('company."deletedAt" IS NULL');
      }

      if (label.includes('opportunity')) {
        expect(insertSql).toContain('opportunity."deletedAt" IS NULL');
      }
    },
  );
});
