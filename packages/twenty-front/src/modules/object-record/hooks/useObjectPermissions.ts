import { useRecoilValue } from 'recoil';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type useObjectPermissionsReturnType = {
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};

export const useObjectPermissions = (): useObjectPermissionsReturnType => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const objectPermissions = currentUserWorkspace?.objectPermissions;

  if (!isDefined(objectPermissions)) {
    return {
      objectPermissionsByObjectMetadataId: {},
    };
  }

  const objectPermissionsByObjectMetadataId = objectPermissions?.reduce(
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
