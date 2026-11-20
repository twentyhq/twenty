import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithRuleOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithRuleOperations';

const ROLE = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  rowLevelPermissionRules: [
    {
      id: 'rule-id',
      objectMetadataId: 'company',
      canReadRecords: true,
      canCreateRecords: false,
      canUpdateRecords: true,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
    },
  ],
};

describe('getRoleWithRuleOperations', () => {
  it('should keep the create grant while edit does not change', () => {
    const role = getRoleWithRuleOperations({
      role: ROLE,
      rowLevelPermissionRuleId: 'rule-id',
      operations: [
        'canReadObjectRecords',
        'canUpdateObjectRecords',
        'canSoftDeleteObjectRecords',
      ],
    });

    expect(role.rowLevelPermissionRules?.[0]).toMatchObject({
      canCreateRecords: false,
      canUpdateRecords: true,
      canSoftDeleteRecords: true,
    });
  });

  it('should follow edit when edit changes', () => {
    const role = getRoleWithRuleOperations({
      role: {
        ...ROLE,
        rowLevelPermissionRules: ROLE.rowLevelPermissionRules.map((rule) => ({
          ...rule,
          canCreateRecords: true,
        })),
      },
      rowLevelPermissionRuleId: 'rule-id',
      operations: ['canReadObjectRecords'],
    });

    expect(role.rowLevelPermissionRules?.[0]).toMatchObject({
      canCreateRecords: false,
      canUpdateRecords: false,
    });
  });
});
