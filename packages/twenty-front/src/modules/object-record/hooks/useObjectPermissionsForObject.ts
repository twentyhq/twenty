import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

export const useObjectPermissionsForObject = (
  objectMetadataId: string,
): ObjectPermissionsWithObjectMetadataId => {
  const objectPermissionsByObjectMetadataId = useAtomStateValue(
    objectPermissionsByObjectMetadataIdSelector,
  );

  return useMemo(
    () =>
      getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataId,
      ),
    [objectPermissionsByObjectMetadataId, objectMetadataId],
  );
};
