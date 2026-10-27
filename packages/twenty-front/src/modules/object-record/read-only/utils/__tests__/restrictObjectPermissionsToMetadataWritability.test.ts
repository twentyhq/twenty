import { restrictObjectPermissionsToMetadataWritability } from '@/object-record/read-only/utils/restrictObjectPermissionsToMetadataWritability';
import { type ObjectPermissions } from 'twenty-shared/types';
import { MetadataWritability } from '~/generated-metadata/graphql';

const FULL_OBJECT_PERMISSIONS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

describe('restrictObjectPermissionsToMetadataWritability', () => {
  it.each([MetadataWritability.OPEN, null, undefined])(
    'should keep permissions when writability is %s',
    (writability) => {
      expect(
        restrictObjectPermissionsToMetadataWritability({
          objectPermissions: FULL_OBJECT_PERMISSIONS,
          writability,
        }),
      ).toBe(FULL_OBJECT_PERMISSIONS);
    },
  );

  it('should revoke write permissions when writability is SYSTEM', () => {
    expect(
      restrictObjectPermissionsToMetadataWritability({
        objectPermissions: FULL_OBJECT_PERMISSIONS,
        writability: MetadataWritability.SYSTEM,
      }),
    ).toEqual({
      ...FULL_OBJECT_PERMISSIONS,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });
});
