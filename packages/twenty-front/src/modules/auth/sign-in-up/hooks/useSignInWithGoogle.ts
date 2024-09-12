import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';

export const useSignInWithGoogle = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const { signInWithGoogle } = useAuth();
  return {
    signInWithGoogle: () =>
      signInWithGoogle({ workspaceInviteHash, workspacePersonalInviteToken }),
  };
};
