import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';

export const useSignInWithOIDC = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const { signInWithOIDC } = useAuth();
  return {
    signInWithOIDC: () =>
      signInWithOIDC({
        workspaceInviteHash,
        workspacePersonalInviteToken,
      }),
  };
};
