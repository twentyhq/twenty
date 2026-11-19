import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithoutRowLevelPermissionRules } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithoutRowLevelPermissionRules';
import {
  type FieldPermission,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionRule,
} from '~/generated-metadata/graphql';

const buildRule = (id: string): RowLevelPermissionRule => ({
  __typename: 'RowLevelPermissionRule',
  id,
  objectMetadataId: 'company',
  canReadRecords: true,
  canCreateRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
});

const buildPredicateGroup = ({
  id,
  ruleId,
}: {
  id: string;
  ruleId: string;
}): RowLevelPermissionPredicateGroup => ({
  __typename: 'RowLevelPermissionPredicateGroup',
  id,
  parentRowLevelPermissionPredicateGroupId: null,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  roleId: 'role-id',
  objectMetadataId: 'company',
  rowLevelPermissionRuleId: ruleId,
});

const buildPredicate = ({
  id,
  ruleId,
  relationFieldMetadataId = null,
}: {
  id: string;
  ruleId: string;
  relationFieldMetadataId?: string | null;
}): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id,
  fieldMetadataId: 'field-id',
  relationFieldMetadataId,
  objectMetadataId: 'company',
  operand: RowLevelPermissionPredicateOperand.IS,
  rowLevelPermissionPredicateGroupId: `${ruleId}-group`,
  rowLevelPermissionRuleId: ruleId,
  roleId: 'role-id',
  value: 'value',
});

const buildFieldPermission = ({
  id,
  groupId,
}: {
  id: string;
  groupId: string | null;
}): FieldPermission => ({
  __typename: 'FieldPermission',
  id,
  roleId: 'role-id',
  objectMetadataId: 'company',
  fieldMetadataId: `${id}-field-id`,
  canReadFieldValue: false,
  canUpdateFieldValue: false,
  rowLevelPermissionPredicateGroupId: groupId,
});

describe('getRoleWithoutRowLevelPermissionRules', () => {
  it('should drop the removed rules with their conditions and field restrictions only', () => {
    const role = getRoleWithoutRowLevelPermissionRules({
      role: {
        ...DEFAULT_SETTINGS_DRAFT_ROLE,
        rowLevelPermissionRules: [buildRule('owner'), buildRule('team')],
        rowLevelPermissionPredicates: [
          buildPredicate({ id: 'owner-predicate', ruleId: 'owner' }),
          buildPredicate({
            id: 'owner-related-predicate',
            ruleId: 'owner',
            relationFieldMetadataId: 'relation-field-id',
          }),
          buildPredicate({ id: 'team-predicate', ruleId: 'team' }),
        ],
        rowLevelPermissionPredicateGroups: [
          buildPredicateGroup({ id: 'owner-group', ruleId: 'owner' }),
          buildPredicateGroup({ id: 'team-group', ruleId: 'team' }),
        ],
        fieldPermissions: [
          buildFieldPermission({ id: 'owner-field', groupId: 'owner-group' }),
          buildFieldPermission({ id: 'team-field', groupId: 'team-group' }),
          buildFieldPermission({ id: 'object-field', groupId: null }),
        ],
      },
      ruleIds: ['owner'],
    });

    expect(role.rowLevelPermissionRules?.map(({ id }) => id)).toEqual(['team']);
    expect(role.rowLevelPermissionPredicates?.map(({ id }) => id)).toEqual([
      'team-predicate',
    ]);
    expect(role.rowLevelPermissionPredicateGroups?.map(({ id }) => id)).toEqual(
      ['team-group'],
    );
    expect(role.fieldPermissions?.map(({ id }) => id)).toEqual([
      'team-field',
      'object-field',
    ]);
  });
});
