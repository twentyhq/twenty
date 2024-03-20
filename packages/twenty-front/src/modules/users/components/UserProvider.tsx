import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Workspaces, workspacesState } from '@/auth/states/workspaces';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { isDefined } from '~/utils/isDefined';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setWorkspaces = useSetRecoilState(workspacesState);

  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const { loading: queryLoading, data: queryData } = useQuery(GET_CURRENT_USER);

  useEffect(() => {
    if (!queryLoading) {
      setIsLoading(false);
    }
    if (isDefined(queryData?.currentUser)) {
      setCurrentUser(queryData.currentUser);
      setCurrentWorkspace(queryData.currentUser.defaultWorkspace);
    }
    if (isDefined(queryData?.currentUser?.workspaceMember)) {
      const workspaceMember = queryData.currentUser.workspaceMember;
      setCurrentWorkspaceMember({
        ...workspaceMember,
        colorScheme: (workspaceMember.colorScheme as ColorScheme) ?? 'Light',
      });
    }
    if (isDefined(queryData?.currentUser?.workspaces)) {
      const validWorkspaces = queryData.currentUser.workspaces.filter(
        (obj: any) => obj.workspace !== null && obj.workspace !== undefined,
      );
      const workspaces: Workspaces[] = [];
      validWorkspaces.forEach((validWorkspace: any) => {
        const workspace = validWorkspace.workspace! as Workspaces;
        workspaces.push(workspace);
      });

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
