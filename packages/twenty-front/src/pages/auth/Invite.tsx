import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash';
import { useMemo } from 'react';

import { SignInUp } from '~/pages/auth/SignInUp';

export const Invite = () => {
  const { workspace: workspaceFromInviteHash } = useWorkspaceFromInviteHash();

  const title = useMemo(() => {
    return `Join ${workspaceFromInviteHash?.displayName ?? ''} team`;
  }, [workspaceFromInviteHash?.displayName]);

  return (
    <>
      <SignInUp />
    </>
  );
};
