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
}: GetObjectPermissionsFromMapByObjectIdArgs) => {
  return (
    objectPermissionsByObjectMetadataId[objectMetadataId] ?? {
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canCreateObjectRecords: true,
      canDeleteObjectRecords: true,
      restrictedFields: {},
    }
  );
};
