import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { useGetCurrentUserQuery } from '~/generated/graphql';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const { data: userData, loading: userLoading } = useGetCurrentUserQuery({});

  useEffect(() => {
    if (!userLoading) {
      setIsLoading(false);
    }
    if (userData?.currentUser?.workspaceMember) {
      setCurrentUser(userData.currentUser);
      setCurrentWorkspace(userData.currentUser.defaultWorkspace);
      const workspaceMember = userData.currentUser.workspaceMember;
      setCurrentWorkspaceMember({
        ...workspaceMember,
        colorScheme: (workspaceMember.colorScheme as ColorScheme) ?? 'Light',
      });
    }
  }, [
    setCurrentUser,
    isLoading,
    userLoading,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    userData?.currentUser,
  ]);

  return isLoading ? <></> : <>{children}</>;
};
