import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_CURRENT_USER_AND_VIEWS } from '@/users/graphql/queries/getCurrentUserAndViews';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const { loading: queryLoading, data: queryData } = useQuery(
    GET_CURRENT_USER_AND_VIEWS,
  );

  useEffect(() => {
    if (!queryLoading) {
      setIsLoading(false);
    }
    if (queryData?.currentUser?.workspaceMember) {
      setCurrentUser(queryData.currentUser);
      setCurrentWorkspace(queryData.currentUser.defaultWorkspace);
      const workspaceMember = queryData.currentUser.workspaceMember;
      setCurrentWorkspaceMember({
        ...workspaceMember,
        colorScheme: (workspaceMember.colorScheme as ColorScheme) ?? 'Light',
      });
    }
  }, [
    setCurrentUser,
    isLoading,
    queryLoading,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    queryData?.currentUser,
  ]);

  return isLoading ? <></> : <>{children}</>;
};
