import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { workspacesState } from '@/auth/states/workspaces';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { User } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setWorkspaces = useSetRecoilState(workspacesState);

  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const { loading: queryLoading, data: queryData } = useQuery<{
    currentUser: User;
  }>(GET_CURRENT_USER);

  useEffect(() => {
    if (!queryLoading) {
      setIsLoading(false);
    }

    if (!isDefined(queryData?.currentUser)) return;

    setCurrentUser(queryData.currentUser);
    setCurrentWorkspace(queryData.currentUser.defaultWorkspace);

    const { workspaceMember, workspaces: userWorkspaces } =
      queryData.currentUser;

    if (isDefined(workspaceMember)) {
      setCurrentWorkspaceMember({
        ...workspaceMember,
        colorScheme: (workspaceMember.colorScheme as ColorScheme) ?? 'Light',
      });
    }

    if (isDefined(userWorkspaces)) {
      const workspaces = userWorkspaces
        .map(({ workspace }) => workspace)
        .filter(isDefined);

      setWorkspaces(workspaces);
    }
  }, [
    setCurrentUser,
    isLoading,
    queryLoading,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setWorkspaces,
    queryData?.currentUser,
  ]);

  return isLoading ? <></> : <>{children}</>;
};
