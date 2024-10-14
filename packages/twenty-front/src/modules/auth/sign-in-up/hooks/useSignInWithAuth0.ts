import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';

export const useSignInWithAuth0 = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const { signInWithAuth0 } = useAuth();
  return {
    signInWithAuth0: () =>
      signInWithAuth0({ workspaceInviteHash, workspacePersonalInviteToken }),
  };
};
