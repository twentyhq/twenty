import React, { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { workspacesState } from '@/auth/states/workspaces';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { useGetCurrentUserQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { WorkspaceMember } from '~/generated-metadata/graphql';

export const UserProviderEffect = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useRecoilState(
    isCurrentUserLoadedState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setWorkspaces = useSetRecoilState(workspacesState);

  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentWorkspaceMembers = useSetRecoilState(
    currentWorkspaceMembersState,
  );

  const { loading: queryLoading, data: queryData } = useGetCurrentUserQuery({
    skip: isCurrentUserLoaded,
  });

  useEffect(() => {
    if (!queryLoading) {
      setIsLoading(false);
      setIsCurrentUserLoaded(true);
    }

    if (!isDefined(queryData?.currentUser)) return;

    setCurrentUser(queryData.currentUser);
    setCurrentWorkspace(queryData.currentUser.defaultWorkspace);

    const {
      workspaceMember,
      workspaceMembers,
      workspaces: userWorkspaces,
    } = queryData.currentUser;

    const computeWorkspaceMemberColorScheme = (
      workspaceMember: WorkspaceMember,
    ) => {
      return {
        ...workspaceMember,
        colorScheme: (workspaceMember.colorScheme as ColorScheme) ?? 'Light',
      };
    };

    if (isDefined(workspaceMember)) {
      setCurrentWorkspaceMember(
        computeWorkspaceMemberColorScheme(workspaceMember),
      );
    }

    if (isDefined(workspaceMembers)) {
      setCurrentWorkspaceMembers(
        workspaceMembers.map(computeWorkspaceMemberColorScheme) ?? [],
      );
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
    setIsCurrentUserLoaded,
  ]);

  return <></>;
};
