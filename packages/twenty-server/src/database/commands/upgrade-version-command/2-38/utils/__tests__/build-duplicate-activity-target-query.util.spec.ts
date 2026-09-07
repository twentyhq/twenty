import { buildDuplicateActivityTargetQuery } from 'src/database/commands/upgrade-version-command/2-38/utils/build-duplicate-activity-target-query.util';

const QUERY_ARGS = {
  schemaName: 'workspace_123',
  tableName: 'taskTarget',
  parentColumnName: 'taskId',
  targetColumns: [
    { type: 'person', columnName: 'targetPersonId' },
    { type: 'company', columnName: 'targetCompanyId' },
    { type: 'opportunity', columnName: 'targetOpportunityId' },
  ],
} satisfies Omit<
  Parameters<typeof buildDuplicateActivityTargetQuery>[0],
  'deleteDuplicates'
>;

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
    expect(query).toContain('DELETE FROM "workspace_123"."taskTarget"');
  });

  it('supports legacy activity target column names', () => {
    const query = buildDuplicateActivityTargetQuery({
      ...QUERY_ARGS,
      targetColumns: [
        { type: 'person', columnName: 'personId' },
        { type: 'company', columnName: 'companyId' },
        { type: 'opportunity', columnName: 'opportunityId' },
      ],
      deleteDuplicates: true,
    });

    expect(query).toContain(`('person', "activityTarget"."personId")`);
    expect(query).toContain(`('company', "activityTarget"."companyId")`);
    expect(query).toContain(
      `('opportunity', "activityTarget"."opportunityId")`,
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
