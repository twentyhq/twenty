import { useParams } from 'react-router-dom';

import { useGetWorkspaceFromInviteHashQuery } from '~/generated/graphql';

export const useWorkspaceFromInviteHash = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const { data: workspaceFromInviteHash, loading } =
    useGetWorkspaceFromInviteHashQuery({
      variables: { inviteHash: workspaceInviteHash || '' },
    });
  return {
    workspace: workspaceFromInviteHash?.findWorkspaceFromInviteHash,
    workspaceInviteHash,
    loading,
  };
};
