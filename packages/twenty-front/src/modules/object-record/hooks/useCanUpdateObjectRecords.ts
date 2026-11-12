import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { canAccessThroughAllRecordsOrRlsPermission } from 'twenty-shared/utils';

export const useCanUpdateObjectRecords = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  return {
    canUpdateSomeRecords: canAccessThroughAllRecordsOrRlsPermission({
      objectRecordsPermissions: objectPermissions,
      operationType: 'update',
    }),
  };
};
