import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';

export const useSignInWithMicrosoft = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const { signInWithMicrosoft } = useAuth();
  return {
    signInWithMicrosoft: () =>
      signInWithMicrosoft({
        workspaceInviteHash,
        workspacePersonalInviteToken,
      }),
  };
};
