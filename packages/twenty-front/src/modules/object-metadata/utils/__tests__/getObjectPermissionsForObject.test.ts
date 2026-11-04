import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';

const OBJECT_METADATA_ID = 'object-metadata-id';

describe('getObjectPermissionsForObject', () => {
  it('should allow everything when the object has no permissions entry', () => {
    expect(getObjectPermissionsForObject({}, OBJECT_METADATA_ID)).toEqual({
      objectMetadataId: OBJECT_METADATA_ID,
      canReadAllRecords: true,
      canUpdateAllRecords: true,
      canSoftDeleteAllRecords: true,
      canDestroyAllRecords: true,
      canReadSomeRecords: true,
      canUpdateSomeRecords: true,
      canSoftDeleteSomeRecords: true,
      canDestroySomeRecords: true,
      restrictedFields: {},
      rowLevelRecordsPermissions: null,
    });
  });

  it('should return the permissions of the requested object', () => {
    const restrictedObjectPermissions: ObjectRecordsPermissionsWithObjectMetadataId =
      {
        objectMetadataId: OBJECT_METADATA_ID,
        canReadAllRecords: true,
        canUpdateAllRecords: false,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
        canReadSomeRecords: true,
        canUpdateSomeRecords: false,
        canSoftDeleteSomeRecords: false,
        canDestroySomeRecords: false,
        restrictedFields: {
          'field-metadata-id': { canRead: false, canUpdate: false },
        },
        rowLevelRecordsPermissions: null,
      };

    expect(
      getObjectPermissionsForObject(
        {
          [OBJECT_METADATA_ID]: restrictedObjectPermissions,
          'other-object-metadata-id': {
            ...restrictedObjectPermissions,
            objectMetadataId: 'other-object-metadata-id',
            canReadSomeRecords: false,
          },
        },
        OBJECT_METADATA_ID,
      ),
    ).toEqual(restrictedObjectPermissions);
  });
});
