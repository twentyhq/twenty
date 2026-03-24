import { useMemo } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';

export const useReadableObjectMetadataItems = () => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const readableObjectMetadataItems = useMemo(
    () =>
      activeObjectMetadataItems.filter(
        (item) =>
          getObjectPermissionsFromMapByObjectMetadataId({
            objectPermissionsByObjectMetadataId,
            objectMetadataId: item.id,
          })?.canReadObjectRecords,
      ),
    [activeObjectMetadataItems, objectPermissionsByObjectMetadataId],
  );

  return { readableObjectMetadataItems };
};
