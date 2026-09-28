import { type ObjectPermissions } from 'twenty-shared/types';

type GetObjectPermissionsFromMapByObjectIdArgs = {
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  objectMetadataId: string;
};

export const getObjectPermissionsFromMapByObjectMetadataId = ({
  objectPermissionsByObjectMetadataId,
  objectMetadataId,
}: GetObjectPermissionsFromMapByObjectIdArgs): ObjectPermissions & {
  objectMetadataId: string;
} => {
  return (
    objectPermissionsByObjectMetadataId[objectMetadataId] ?? {
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
      restrictedFields: {},
      objectMetadataId,
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    }
  );
};
