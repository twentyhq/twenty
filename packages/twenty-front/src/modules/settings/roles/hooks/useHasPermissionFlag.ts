import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import { PermissionFlagType } from '~/generated/graphql';

export const useHasPermissionFlag = (permissionFlag?: PermissionFlagType) => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  if (!permissionFlag) {
    return true;
  }

  const userFlags = currentUserWorkspace?.permissionFlags ?? [];
  return userFlags.includes(permissionFlag);
};
