import { getObjectPermissionsForObject } from '~/modules/object-metadata/utils/getObjectPermissionsForObject';

import { useCallback } from 'react';
import { useObjectPermissions } from './useObjectPermissions';

export const useGetObjectPermissionsForObject = (objectMetadataId: string) => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  return useCallback(() => {
    return getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataId,
    );
  }, [objectPermissionsByObjectMetadataId, objectMetadataId]);
};
