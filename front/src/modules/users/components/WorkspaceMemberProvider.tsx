import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { useGetCurrentWorkspaceQuery } from '~/generated/graphql';

export const WorkspaceMemberProvider = ({
  children,
}: React.PropsWithChildren) => {
  const currentUser = useRecoilValue(currentUserState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  const { data: currentWorkspaceData, loading: currentWorkspaceLoading } =
    useGetCurrentWorkspaceQuery();

  const { loading: currentWorkspaceMemberLoading } = useFindManyObjectRecords({
    skip: !currentUser,
    objectNamePlural: 'workspaceMembersV2',
    filter: {
      userId: { eq: currentUser?.id },
    },
    onCompleted: (data: any) => {
      setCurrentWorkspaceMember(data.edges[0].node);
    },
  });

  useEffect(() => {
    if (currentWorkspaceData?.currentWorkspace) {
      setCurrentWorkspace(currentWorkspaceData.currentWorkspace);
    }
  }, [
    currentUser,
    currentWorkspaceData?.currentWorkspace,
    setCurrentWorkspace,
  ]);

  return (currentWorkspaceLoading || currentWorkspaceMemberLoading) &&
    currentUser ? (
    <></>
  ) : (
    <>{children}</>
  );
};
