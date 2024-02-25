import { useParams } from 'react-router-dom';

import { useGetWorkspaceFromInviteHashQuery } from '~/generated/graphql.tsx';

export const useWorkspaceFromInviteHash = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const { data: workspaceFromInviteHash } = useGetWorkspaceFromInviteHashQuery({
    variables: { inviteHash: workspaceInviteHash || '' },
  });
  return workspaceFromInviteHash?.findWorkspaceFromInviteHash;
};
