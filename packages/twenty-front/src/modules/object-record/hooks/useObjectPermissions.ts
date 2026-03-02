import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type useObjectPermissionsReturnType = {
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};

export const useObjectPermissions = (): useObjectPermissionsReturnType => {
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const objectsPermissions = currentUserWorkspace?.objectsPermissions;

  if (!isDefined(objectsPermissions)) {
    return {
      objectPermissionsByObjectMetadataId: {},
    };
  }

  const objectPermissionsByObjectMetadataId = objectsPermissions?.reduce(
    (
      acc: Record<string, ObjectPermissions & { objectMetadataId: string }>,
      objectPermission,
    ) => {
      acc[objectPermission.objectMetadataId] = objectPermission;
      return acc;
    },
    {},
  );

  return {
    objectPermissionsByObjectMetadataId,
  };
};
