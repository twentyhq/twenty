import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { withRowLevelPermissionRuleGrants } from '@/settings/roles/role/utils/withRowLevelPermissionRuleGrants';
import { RowLevelPermissionPredicateOperand } from '~/generated-metadata/graphql';

const rule = {
  __typename: 'RowLevelPermissionRule' as const,
  id: 'rule-id',
  objectMetadataId: 'company-object-id',
  canCreateRecords: true,
  canReadRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
};

describe('withRowLevelPermissionRuleGrants', () => {
  it('should put ungrouped predicates of a rule in a root group carrying its grants', () => {
    const role = withRowLevelPermissionRuleGrants({
      ...DEFAULT_SETTINGS_DRAFT_ROLE,
      rowLevelPermissionRules: [rule],
      rowLevelPermissionPredicateGroups: [],
      rowLevelPermissionPredicates: [
        {
          __typename: 'RowLevelPermissionPredicate',
          id: 'predicate-id',
          fieldMetadataId: 'account-owner-field-id',
          relationFieldMetadataId: null,
          objectMetadataId: 'company-object-id',
          operand: RowLevelPermissionPredicateOperand.IS,
          subFieldName: null,
          workspaceMemberFieldMetadataId: 'workspace-member-id-field',
          workspaceMemberSubFieldName: null,
          rowLevelPermissionPredicateGroupId: null,
          positionInRowLevelPermissionPredicateGroup: null,
          roleId: 'role-id',
          value: null,
          rowLevelPermissionRuleId: 'rule-id',
        },
      ],
    });

    expect(
      role.rowLevelPermissionPredicates?.[0]
        ?.rowLevelPermissionPredicateGroupId,
    ).toBe('rule-id');
    expect(role.rowLevelPermissionPredicateGroups).toEqual([
      expect.objectContaining({
        id: 'rule-id',
        parentRowLevelPermissionPredicateGroupId: null,
        canReadRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: false,
      }),
    ]);
  });
});
