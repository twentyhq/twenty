import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_CURRENT_USER_AND_VIEWS } from '@/users/graphql/getCurrentUserAndViews';
import { preloadedViewsState } from '@/views/states/preloadedViewsState';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setPreloadedViews = useSetRecoilState(preloadedViewsState);

  const { loading: userLoading, data: userAndViewsData } = useQuery(
    GET_CURRENT_USER_AND_VIEWS,
  );

  useEffect(() => {
    if (!userLoading) {
      setIsLoading(false);
    }
    if (userAndViewsData?.currentUser?.workspaceMember) {
      setCurrentUser(userAndViewsData.currentUser);
      setCurrentWorkspace(userAndViewsData.currentUser.defaultWorkspace);
      const workspaceMember = userAndViewsData.currentUser.workspaceMember;
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
    userAndViewsData?.currentUser,
  ]);

  useEffect(() => {
    if (!userAndViewsData?.views) return;

    setPreloadedViews(userAndViewsData?.views);
    console.log('setting preloaded views');
  }, [setPreloadedViews, userAndViewsData?.views]);

  return isLoading ? <></> : <>{children}</>;
};
