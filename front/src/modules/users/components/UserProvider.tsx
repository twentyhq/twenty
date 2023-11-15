import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FIND_ONE_WORKSPACE_MEMBER_V2 } from '@/object-record/graphql/queries/findOneWorkspaceMember';
import {
  useGetCurrentUserQuery,
  useGetCurrentWorkspaceQuery,
} from '~/generated/graphql';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkspaceMemberLoading, setIsWorkspaceMemberLoading] =
    useState(true);
  const apolloClient = useApolloClient();

  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const { data: userData, loading: userLoading } = useGetCurrentUserQuery({
    onCompleted: async (data) => {
      const workspaceMember = await apolloClient.query({
        query: FIND_ONE_WORKSPACE_MEMBER_V2,
        variables: {
          filter: {
            userId: { eq: data.currentUser.id },
          },
        },
      });
      setCurrentWorkspaceMember(
        workspaceMember.data.workspaceMembersV2.edges[0].node,
      );
      setIsWorkspaceMemberLoading(false);
    },
    onError: () => {
      setIsWorkspaceMemberLoading(false);
    },
  });

  const { data: workspaceData, loading: workspaceLoading } =
    useGetCurrentWorkspaceQuery();

  useEffect(() => {
    if (!userLoading && !workspaceLoading && !isWorkspaceMemberLoading) {
      setIsLoading(false);
    }
    if (userData?.currentUser) {
      setCurrentUser(userData.currentUser);
    }
    if (workspaceData?.currentWorkspace) {
      setCurrentWorkspace(workspaceData.currentWorkspace);
    }
  }, [
    setCurrentUser,
    isLoading,
    userLoading,
    workspaceLoading,
    userData?.currentUser,
    workspaceData?.currentWorkspace,
    setCurrentWorkspace,
    isWorkspaceMemberLoading,
  ]);

  return isLoading ? <></> : <>{children}</>;
};
