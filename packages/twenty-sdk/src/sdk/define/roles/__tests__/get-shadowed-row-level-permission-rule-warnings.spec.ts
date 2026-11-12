import { getShadowedRowLevelPermissionRuleWarnings } from '@/sdk/define/roles/get-shadowed-row-level-permission-rule-warnings';

const RULE = {
  universalIdentifier: 'rule',
  objectUniversalIdentifier: 'company',
  canReadRecords: true,
  canUpdateRecords: true,
};

describe('getShadowedRowLevelPermissionRuleWarnings', () => {
  it('should not warn when the role grants nothing on all records of the object', () => {
    expect(
      getShadowedRowLevelPermissionRuleWarnings({
        role: {
          canReadAllObjectRecords: true,
          objectPermissions: [
            {
              objectUniversalIdentifier: 'company',
              canReadObjectRecords: false,
            },
          ],
        },
        rowLevelPermissionRules: [RULE],
      }),
    ).toEqual([]);
  });

  it('should warn about the operations an object permission or the role already grants on all records', () => {
    const warnings = getShadowedRowLevelPermissionRuleWarnings({
      role: {
        canUpdateAllObjectRecords: true,
        objectPermissions: [
          { objectUniversalIdentifier: 'company', canReadObjectRecords: true },
        ],
      },
      rowLevelPermissionRules: [RULE],
    });

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('is ignored for read, update');
  });
});
