import { buildDuplicateActivityTargetQuery } from 'src/database/commands/upgrade-version-command/2-38/utils/build-duplicate-activity-target-query.util';

const QUERY_ARGS = {
  schemaName: 'workspace_123',
  tableName: 'taskTarget',
  parentColumnName: 'taskId',
};

describe('buildDuplicateActivityTargetQuery', () => {
  it('partitions each morph target type independently and deletes duplicates', () => {
    const query = buildDuplicateActivityTargetQuery({
      ...QUERY_ARGS,
      deleteDuplicates: true,
    });

    expect(query).toContain('"activityTarget"."taskId"');
    expect(query).toContain(`('person', "activityTarget"."targetPersonId")`);
    expect(query).toContain(`('company', "activityTarget"."targetCompanyId")`);
    expect(query).toContain(
      `('opportunity', "activityTarget"."targetOpportunityId")`,
    );
    expect(query).toContain(
      'ORDER BY\n          ("activityTarget"."deletedAt" IS NULL) DESC',
    );
    expect(query).toContain(
      'DELETE FROM "workspace_123"."taskTarget"',
    );
  });

  it('only counts duplicates on a dry run', () => {
    const query = buildDuplicateActivityTargetQuery({
      ...QUERY_ARGS,
      deleteDuplicates: false,
    });

    expect(query).not.toContain('DELETE FROM');
    expect(query).toContain(
      'SELECT COUNT(*)::integer AS "count" FROM "duplicateTargets"',
    );
  });
});
