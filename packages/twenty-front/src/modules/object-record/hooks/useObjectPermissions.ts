import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';

type useObjectPermissionsReturnType = {
  objectPermissionsByObjectMetadataId: Record<string, ObjectPermission>;
};

export const useObjectPermissions = (): useObjectPermissionsReturnType => {
  const currentUser = useRecoilValue(currentUserState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const objectPermissions = currentUserWorkspace?.objectPermissions;

  // Super Admin users have access to all objects
  const isSuperAdmin =
    currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel;

  if (!isDefined(objectPermissions)) {
    return {
      objectPermissionsByObjectMetadataId: {},
    };
  }

  const objectPermissionsByObjectMetadataId = objectPermissions?.reduce(
    (acc: Record<string, ObjectPermission>, objectPermission) => {
      // For Super Admin users, grant full permissions
      if (isSuperAdmin === true) {
        acc[objectPermission.objectMetadataId] = {
          ...objectPermission,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
        };
      } else {
        acc[objectPermission.objectMetadataId] = objectPermission;
      }
      return acc;
    },
    {},
  );

  return {
    objectPermissionsByObjectMetadataId,
  };
};
