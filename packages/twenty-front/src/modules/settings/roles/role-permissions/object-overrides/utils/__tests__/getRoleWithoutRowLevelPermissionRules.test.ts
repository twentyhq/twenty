import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithoutRowLevelPermissionRules } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithoutRowLevelPermissionRules';
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
  rowLevelPermissionRuleId,
}: {
  id: string;
  rowLevelPermissionRuleId: string;
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
  rowLevelPermissionRuleId,
});

const buildPredicate = ({
  id,
  rowLevelPermissionRuleId,
  relationFieldMetadataId = null,
}: {
  id: string;
  rowLevelPermissionRuleId: string;
  relationFieldMetadataId?: string | null;
}): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id,
  fieldMetadataId: 'field-id',
  relationFieldMetadataId,
  objectMetadataId: 'company',
  operand: RowLevelPermissionPredicateOperand.IS,
  rowLevelPermissionPredicateGroupId: `${rowLevelPermissionRuleId}-group`,
  rowLevelPermissionRuleId,
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
          buildPredicate({
            id: 'owner-predicate',
            rowLevelPermissionRuleId: 'owner',
          }),
          buildPredicate({
            id: 'owner-related-predicate',
            rowLevelPermissionRuleId: 'owner',
            relationFieldMetadataId: 'relation-field-id',
          }),
          buildPredicate({
            id: 'team-predicate',
            rowLevelPermissionRuleId: 'team',
          }),
        ],
        rowLevelPermissionPredicateGroups: [
          buildPredicateGroup({
            id: 'owner-group',
            rowLevelPermissionRuleId: 'owner',
          }),
          buildPredicateGroup({
            id: 'team-group',
            rowLevelPermissionRuleId: 'team',
          }),
        ],
        fieldPermissions: [
          buildFieldPermission({ id: 'owner-field', groupId: 'owner-group' }),
          buildFieldPermission({ id: 'team-field', groupId: 'team-group' }),
          buildFieldPermission({ id: 'object-field', groupId: null }),
        ],
      },
      shouldRemoveRule: (rule) => rule.id === 'owner',
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
