import { filterFieldPermissionsOfPredicateGroups } from '@/settings/roles/role/utils/filterFieldPermissionsOfPredicateGroups';
import { type FieldPermission } from '~/generated-metadata/graphql';

const buildFieldPermission = ({
  id,
  rowLevelPermissionPredicateGroupId,
}: Pick<
  FieldPermission,
  'id' | 'rowLevelPermissionPredicateGroupId'
>): FieldPermission => ({
  id,
  roleId: 'role-id',
  objectMetadataId: 'object-id',
  fieldMetadataId: `field-${id}`,
  canReadFieldValue: false,
  rowLevelPermissionPredicateGroupId,
});

describe('filterFieldPermissionsOfPredicateGroups', () => {
  it('should keep only field permissions of existing predicate groups', () => {
    const kept = buildFieldPermission({
      id: 'kept',
      rowLevelPermissionPredicateGroupId: 'group-1',
    });

    expect(
      filterFieldPermissionsOfPredicateGroups({
        fieldPermissions: [
          kept,
          buildFieldPermission({
            id: 'removed-group',
            rowLevelPermissionPredicateGroupId: 'group-2',
          }),
          buildFieldPermission({
            id: 'object-level',
            rowLevelPermissionPredicateGroupId: null,
          }),
          buildFieldPermission({ id: 'no-group' }),
        ],
        predicateGroups: [{ id: 'group-1' }],
      }),
    ).toEqual([kept]);
  });
});
