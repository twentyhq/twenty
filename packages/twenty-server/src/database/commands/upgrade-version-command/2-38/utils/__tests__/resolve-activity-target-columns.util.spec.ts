import { resolveActivityTargetColumns } from 'src/database/commands/upgrade-version-command/2-38/utils/resolve-activity-target-columns.util';

describe('resolveActivityTargetColumns', () => {
  it('prefers the current column names', () => {
    expect(
      resolveActivityTargetColumns(
        new Set([
          'targetPersonId',
          'personId',
          'targetCompanyId',
          'companyId',
          'targetOpportunityId',
          'opportunityId',
        ]),
      ),
    ).toEqual([
      { type: 'person', columnName: 'targetPersonId' },
      { type: 'company', columnName: 'targetCompanyId' },
      { type: 'opportunity', columnName: 'targetOpportunityId' },
    ]);
  });

  it('falls back to the legacy column names', () => {
    expect(
      resolveActivityTargetColumns(
        new Set(['personId', 'companyId', 'opportunityId']),
      ),
    ).toEqual([
      { type: 'person', columnName: 'personId' },
      { type: 'company', columnName: 'companyId' },
      { type: 'opportunity', columnName: 'opportunityId' },
    ]);
  });

  it('returns undefined when a target column is missing', () => {
    expect(
      resolveActivityTargetColumns(new Set(['personId', 'companyId'])),
    ).toBeUndefined();
  });
});
