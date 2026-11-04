import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

export const useObjectPermissionsForObject = (
  objectMetadataId: string,
): ObjectRecordsPermissionsWithObjectMetadataId => {
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
