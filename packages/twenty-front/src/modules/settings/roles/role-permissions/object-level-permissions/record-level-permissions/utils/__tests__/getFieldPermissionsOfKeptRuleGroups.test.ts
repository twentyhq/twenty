import { getFieldPermissionsOfKeptRuleGroups } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getFieldPermissionsOfKeptRuleGroups';
import { type FieldPermission } from '~/generated-metadata/graphql';

const buildFieldPermission = ({
  id,
  rowLevelPermissionPredicateGroupId,
}: {
  id: string;
  rowLevelPermissionPredicateGroupId: string | null;
}): FieldPermission => ({
  id,
  fieldMetadataId: 'field-id',
  objectMetadataId: 'object-id',
  roleId: 'role-id',
  rowLevelPermissionPredicateGroupId,
  canUpdateFieldValue: false,
});

describe('getFieldPermissionsOfKeptRuleGroups', () => {
  it('should only drop the field permissions of the rule groups that were removed', () => {
    expect(
      getFieldPermissionsOfKeptRuleGroups({
        fieldPermissions: [
          buildFieldPermission({
            id: 'all-records',
            rowLevelPermissionPredicateGroupId: null,
          }),
          buildFieldPermission({
            id: 'kept-group',
            rowLevelPermissionPredicateGroupId: 'kept',
          }),
          buildFieldPermission({
            id: 'removed-group',
            rowLevelPermissionPredicateGroupId: 'removed',
          }),
          buildFieldPermission({
            id: 'other-rule',
            rowLevelPermissionPredicateGroupId: 'other-rule-group',
          }),
        ],
        rulePredicateGroupIds: new Set(['kept', 'removed']),
        keptPredicateGroupIds: new Set(['kept']),
      }).map(({ id }) => id),
    ).toEqual(['all-records', 'kept-group', 'other-rule']);
  });
});
