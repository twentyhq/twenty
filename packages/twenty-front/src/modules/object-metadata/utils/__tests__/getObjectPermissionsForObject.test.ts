import { type ObjectPermissions } from 'twenty-shared/types';

import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';

const OBJECT_METADATA_ID = 'object-metadata-id';

describe('getObjectPermissionsForObject', () => {
  it('should allow everything with the ObjectPermissions shape when the object has no permissions entry', () => {
    expect(getObjectPermissionsForObject({}, OBJECT_METADATA_ID)).toEqual({
      objectMetadataId: OBJECT_METADATA_ID,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
  });

  it('should return the permissions of the requested object', () => {
    const restrictedObjectPermissions: ObjectPermissions & {
      objectMetadataId: string;
    } = {
      objectMetadataId: OBJECT_METADATA_ID,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {
        'field-metadata-id': { canRead: false, canUpdate: false },
      },
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    };

    expect(
      getObjectPermissionsForObject(
        {
          [OBJECT_METADATA_ID]: restrictedObjectPermissions,
          'other-object-metadata-id': {
            ...restrictedObjectPermissions,
            objectMetadataId: 'other-object-metadata-id',
            canReadObjectRecords: false,
          },
        },
        OBJECT_METADATA_ID,
      ),
    ).toEqual(restrictedObjectPermissions);
  });
});
