import { useRecoilValue } from 'recoil';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { ObjectPermission } from '~/generated-metadata/graphql';

export const useObjectPermissions = () => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const objectPermissions = currentUserWorkspace?.objectPermissions;

  const objectPermissionsByObjectMetadataId = objectPermissions?.reduce(
    (acc, objectPermission) => {
      acc[objectPermission.objectMetadataId] = objectPermission;
      return acc;
    },
    {} as Record<string, ObjectPermission>,
  );

  return {
    objectPermissionsByObjectMetadataId,
  };
};
