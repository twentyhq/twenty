import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { type ObjectPermissions } from 'twenty-shared/types';

const objectPermissions: ObjectPermissions & { objectMetadataId: string } = {
  objectMetadataId: 'restricted-object',
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

describe('getObjectPermissionsFromMapByObjectMetadataId', () => {
  it('returns the permissions recorded for the object', () => {
    expect(
      getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId: {
          'restricted-object': objectPermissions,
        },
        objectMetadataId: 'restricted-object',
      }),
    ).toEqual(objectPermissions);
  });

  it('grants every permission when the object has no recorded restriction', () => {
    expect(
      getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId: {},
        objectMetadataId: 'unrestricted-object',
      }),
    ).toEqual({
      objectMetadataId: 'unrestricted-object',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
  });
});
