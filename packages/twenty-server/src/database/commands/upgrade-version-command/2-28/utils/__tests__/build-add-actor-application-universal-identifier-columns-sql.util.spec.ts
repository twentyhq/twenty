import { buildAddActorApplicationUniversalIdentifierColumnsSql } from 'src/database/commands/upgrade-version-command/2-28/utils/build-add-actor-application-universal-identifier-columns-sql.util';

describe('buildAddActorApplicationUniversalIdentifierColumnsSql', () => {
  it('builds idempotent DDL without a default or row backfill', () => {
    const sql = buildAddActorApplicationUniversalIdentifierColumnsSql({
      schemaName: 'workspace_test',
      actorApplicationUniversalIdentifierColumnTarget: {
        tableName: 'person',
        columnNames: ['createdByApplicationUniversalIdentifier'],
      },
    });

    expect(sql).toBe(
      'ALTER TABLE "workspace_test"."person" ADD COLUMN IF NOT EXISTS "createdByApplicationUniversalIdentifier" uuid',
    );
    expect(sql).not.toContain('DEFAULT');
    expect(sql).not.toContain('NOT NULL');
    expect(sql).not.toContain('UPDATE');
  });
});
