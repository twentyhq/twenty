import { useRecoilValue } from 'recoil';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermissionsWithRestrictedFields } from '~/generated/graphql';

type useObjectPermissionsReturnType = {
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissionsWithRestrictedFields
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
      acc: Record<string, ObjectPermissionsWithRestrictedFields>,
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
