import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

const OBJECT_METADATA_ID = 'object-metadata-id';

describe('getObjectPermissionsForObject', () => {
  it('should allow everything when the object has no permissions entry', () => {
    expect(getObjectPermissionsForObject({}, OBJECT_METADATA_ID)).toEqual({
      canCreateAllRecords: true,
      canReadAllRecords: true,
      canUpdateAllRecords: true,
      canSoftDeleteAllRecords: true,
      canDestroyAllRecords: true,
      unreadableFields: [],
      uneditableFields: [],
    });
  });

  it('should return the permissions of the requested object', () => {
    const restrictedObjectPermissions: ObjectRecordsPermissions = {
      canCreateAllRecords: false,
      canReadAllRecords: true,
      canUpdateAllRecords: false,
      canSoftDeleteAllRecords: false,
      canDestroyAllRecords: false,
      unreadableFields: ['field-metadata-id'],
      uneditableFields: ['field-metadata-id'],
      rowLevelRecordsPermissions: null,
    };

    expect(
      getObjectPermissionsForObject(
        {
          [OBJECT_METADATA_ID]: restrictedObjectPermissions,
          'other-object-metadata-id': {
            ...restrictedObjectPermissions,
            canReadAllRecords: false,
          },
        },
        OBJECT_METADATA_ID,
      ),
    ).toEqual(restrictedObjectPermissions);
  });
});
