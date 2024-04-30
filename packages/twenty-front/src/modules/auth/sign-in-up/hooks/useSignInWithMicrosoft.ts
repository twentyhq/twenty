import { useParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth.ts';

export const useSignInWithMicrosoft = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const { signInWithMicrosoft } = useAuth();
  return {
    signInWithMicrosoft: () => signInWithMicrosoft(workspaceInviteHash),
  };
};
