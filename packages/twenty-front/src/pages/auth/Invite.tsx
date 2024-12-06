import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { SignInUpWorkspaceScopeForm } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeForm';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useWorkspaceSwitching } from '@/ui/navigation/navigation-drawer/hooks/useWorkspaceSwitching';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AnimatedEaseIn, Loader, MainButton } from 'twenty-ui';
import {
  useAddUserToWorkspaceByInviteTokenMutation,
  useAddUserToWorkspaceMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { currentUserState } from '@/auth/states/currentUserState';
import { SignInUpWorkspaceScopeFormEffect } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeFormEffect';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const Invite = () => {
  const { workspace: workspaceFromInviteHash, workspaceInviteHash } =
    useWorkspaceFromInviteHash();

  const { form } = useSignInUpForm();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUser = useRecoilValue(currentUserState);
  const [addUserToWorkspace] = useAddUserToWorkspaceMutation();
  const [addUserToWorkspaceByInviteToken] =
    useAddUserToWorkspaceByInviteTokenMutation();
  const { switchWorkspace } = useWorkspaceSwitching();
  const [searchParams] = useSearchParams();
  const workspaceInviteToken = searchParams.get('inviteToken');

  const title = useMemo(() => {
    return `Join ${workspaceFromInviteHash?.displayName ?? ''} team`;
  }, [workspaceFromInviteHash?.displayName]);

  const handleUserJoinWorkspace = async () => {
    if (isDefined(workspaceInviteToken) && isDefined(workspaceFromInviteHash)) {
      await addUserToWorkspaceByInviteToken({
        variables: {
          inviteToken: workspaceInviteToken,
        },
      });
    } else if (
      isDefined(workspaceInviteHash) &&
      isDefined(workspaceFromInviteHash)
    ) {
      await addUserToWorkspace({
        variables: {
          inviteHash: workspaceInviteHash,
        },
      });
    } else {
      return;
    }

    await switchWorkspace(workspaceFromInviteHash.id);
  };

  if (
    !isDefined(workspaceFromInviteHash) ||
    (isDefined(workspaceFromInviteHash) &&
      isDefined(currentWorkspace) &&
      workspaceFromInviteHash.id === currentWorkspace.id)
  ) {
    return <></>;
  }

  return (
    <>
      <AnimatedEaseIn>
        <Logo secondaryLogo={workspaceFromInviteHash?.logo} />
      </AnimatedEaseIn>
      <Title animate>{title}</Title>
      {isDefined(currentUser) ? (
        <>
          <StyledContentContainer>
            <MainButton
              title="Continue"
              type="submit"
              onClick={handleUserJoinWorkspace}
              Icon={() => form.formState.isSubmitting && <Loader />}
              fullWidth
            />
          </StyledContentContainer>
          <FooterNote />
        </>
      ) : (
        <>
          <SignInUpWorkspaceScopeFormEffect />
          <SignInUpWorkspaceScopeForm />
        </>
      )}
    </>
  );
};
