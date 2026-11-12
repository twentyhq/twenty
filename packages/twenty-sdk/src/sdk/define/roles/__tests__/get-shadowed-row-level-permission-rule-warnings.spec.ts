import { getShadowedRowLevelPermissionRuleWarnings } from '@/sdk/define/roles/get-shadowed-row-level-permission-rule-warnings';

const RULE = {
  universalIdentifier: 'rule',
  canReadRecords: true,
  canUpdateRecords: true,
};

describe('getShadowedRowLevelPermissionRuleWarnings', () => {
  it('should not warn when the object grants nothing on all records for the operations of its rule', () => {
    expect(
      getShadowedRowLevelPermissionRuleWarnings({
        role: { canReadAllObjectRecords: true },
        objectRecordsPermissions: [
          { canReadAllRecords: false, rowLevelRecordsPermissions: [RULE] },
        ],
      }),
    ).toEqual([]);
  });

  it('should warn about the operations the object or the role already grants on all records', () => {
    const warnings = getShadowedRowLevelPermissionRuleWarnings({
      role: { canUpdateAllObjectRecords: true },
      objectRecordsPermissions: [
        { canReadAllRecords: true, rowLevelRecordsPermissions: [RULE] },
      ],
    });

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('are ignored for read, update');
  });
});
