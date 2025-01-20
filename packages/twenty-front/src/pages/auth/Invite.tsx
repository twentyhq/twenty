import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { SignInUpWorkspaceScopeForm } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeForm';
import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash';
import { useMemo } from 'react';
import { AnimatedEaseIn } from 'twenty-ui';

import { SignInUpWorkspaceScopeFormEffect } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeFormEffect';

export const Invite = () => {
  const { workspace: workspaceFromInviteHash } = useWorkspaceFromInviteHash();

  const title = useMemo(() => {
    return `Join ${workspaceFromInviteHash?.displayName ?? ''} team`;
  }, [workspaceFromInviteHash?.displayName]);

  return (
    <>
      <AnimatedEaseIn>
        <Logo secondaryLogo={workspaceFromInviteHash?.logo} />
      </AnimatedEaseIn>
      <Title animate>{title}</Title>
      <SignInUpWorkspaceScopeFormEffect />
      <SignInUpWorkspaceScopeForm />
    </>
  );
};
