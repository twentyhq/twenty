import { filterFieldPermissionsOfPredicateGroups } from '@/settings/roles/role/utils/filterFieldPermissionsOfPredicateGroups';
import { type FieldPermission } from '~/generated-metadata/graphql';

const buildFieldPermission = (
  id: string,
  rowLevelPermissionPredicateGroupId?: string | null,
): FieldPermission => ({
  id,
  roleId: 'role-id',
  objectMetadataId: 'object-id',
  fieldMetadataId: `field-${id}`,
  canReadFieldValue: false,
  rowLevelPermissionPredicateGroupId,
});

describe('filterFieldPermissionsOfPredicateGroups', () => {
  it('should keep only field permissions of existing predicate groups', () => {
    const kept = buildFieldPermission('kept', 'group-1');

    expect(
      filterFieldPermissionsOfPredicateGroups({
        fieldPermissions: [
          kept,
          buildFieldPermission('removed-group', 'group-2'),
          buildFieldPermission('object-level', null),
          buildFieldPermission('no-group'),
        ],
        predicateGroups: [{ id: 'group-1' }],
      }),
    ).toEqual([kept]);
  });
});
