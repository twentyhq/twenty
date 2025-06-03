import { useRecoilValue } from 'recoil';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';

export const useObjectPermissions = () => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const objectPermissions = currentUserWorkspace?.objectPermissions;

  if (!isDefined(objectPermissions)) {
    throw new Error('Object permissions not found');
  }

  const objectPermissionsByObjectMetadataId = objectPermissions.reduce(
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
