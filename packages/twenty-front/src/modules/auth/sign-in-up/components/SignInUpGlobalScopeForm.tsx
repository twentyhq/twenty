import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { FormProvider } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { ClickToActionLink, UndecoratedLink } from 'twenty-ui/navigation';

import { useAuth } from '@/auth/hooks/useAuth';
import { SignInUpWithCredentials } from '@/auth/sign-in-up/components/internal/SignInUpWithCredentials';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/internal/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/internal/SignInUpWithMicrosoft';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useSignUpInNewWorkspace } from '@/auth/sign-in-up/hooks/useSignUpInNewWorkspace';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { getAvailableWorkspacePathAndSearchParams } from '@/auth/utils/availableWorkspacesUtils';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import {
  Avatar,
  HorizontalSeparator,
  IconChevronRight,
  IconPlus,
} from 'twenty-ui/display';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

const StyledContentContainer = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  min-width: 200px;
`;

const StyledWorkspaceContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  overflow: hidden;
  width: 100%;

  > * {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};

    &:last-child {
      border-bottom: none;
    }
  }
`;

const StyledWorkspaceItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: ${({ theme }) => theme.spacing(15)};
  padding: 0;
  overflow: hidden;

  cursor: pointer;
  justify-content: space-between;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StyledWorkspaceContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

const StyledWorkspaceTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledWorkspaceLogo = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: ${({ theme }) => theme.spacing(6)};
  width: ${({ theme }) => theme.spacing(6)};
  background-color: ${({ theme }) => theme.background.transparent.light};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledWorkspaceName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledWorkspaceUrl = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledChevronIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

const StyledActionLinkContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const SignInUpGlobalScopeForm = () => {
  const authProviders = useRecoilValueV2(authProvidersState);
  const signInUpStep = useRecoilValue(signInUpStepState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { signOut } = useAuth();

  const { createWorkspace } = useSignUpInNewWorkspace();
  const availableWorkspaces = useRecoilValue(availableWorkspacesState);
  const theme = useTheme();
  const { t } = useLingui();

  const { form } = useSignInUpForm();

  const getAvailableWorkspaceUrl = (availableWorkspace: AvailableWorkspace) => {
    const { pathname, searchParams } = getAvailableWorkspacePathAndSearchParams(
      availableWorkspace,
      { email: form.getValues('email') },
    );

    return buildWorkspaceUrl(
      getWorkspaceUrl(availableWorkspace.workspaceUrls),
      pathname,
      searchParams,
    );
  };

  return (
    <>
      {signInUpStep === SignInUpStep.WorkspaceSelection && (
        <>
          <StyledWorkspaceContainer>
            {[
              ...availableWorkspaces.availableWorkspacesForSignIn,
              ...availableWorkspaces.availableWorkspacesForSignUp,
            ].map((availableWorkspace) => (
              <UndecoratedLink
                key={availableWorkspace.id}
                to={getAvailableWorkspaceUrl(availableWorkspace)}
              >
                <StyledWorkspaceItem>
                  <StyledWorkspaceContent>
                    <Avatar
                      placeholder={availableWorkspace.displayName || ''}
                      avatarUrl={
                        availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO
                      }
                      size="lg"
                    />
                    <StyledWorkspaceTextContainer>
                      <StyledWorkspaceName>
                        {availableWorkspace.displayName ||
                          availableWorkspace.id}
                      </StyledWorkspaceName>
                      <StyledWorkspaceUrl>
                        {
                          new URL(
                            getWorkspaceUrl(availableWorkspace.workspaceUrls),
                          ).hostname
                        }
                      </StyledWorkspaceUrl>
                    </StyledWorkspaceTextContainer>
                    <StyledChevronIcon>
                      <IconChevronRight size={theme.icon.size.md} />
                    </StyledChevronIcon>
                  </StyledWorkspaceContent>
                </StyledWorkspaceItem>
              </UndecoratedLink>
            ))}
            <StyledWorkspaceItem onClick={() => createWorkspace()}>
              <StyledWorkspaceContent>
                <StyledWorkspaceLogo>
                  <IconPlus size={theme.icon.size.lg} />
                </StyledWorkspaceLogo>
                <StyledWorkspaceTextContainer>
                  <StyledWorkspaceName>{t`Create a workspace`}</StyledWorkspaceName>
                </StyledWorkspaceTextContainer>
                <StyledChevronIcon>
                  <IconChevronRight size={theme.icon.size.md} />
                </StyledChevronIcon>
              </StyledWorkspaceContent>
            </StyledWorkspaceItem>
          </StyledWorkspaceContainer>
          <StyledActionLinkContainer>
            <ClickToActionLink onClick={signOut}>
              <Trans>Log out</Trans>
            </ClickToActionLink>
          </StyledActionLinkContainer>
        </>
      )}
      {signInUpStep !== SignInUpStep.WorkspaceSelection && (
        <StyledContentContainer>
          {authProviders.google && (
            <SignInUpWithGoogle
              action="list-available-workspaces"
              isGlobalScope
            />
          )}
          {authProviders.microsoft && (
            <SignInUpWithMicrosoft
              action="list-available-workspaces"
              isGlobalScope
            />
          )}
          {(authProviders.google || authProviders.microsoft) && (
            <HorizontalSeparator />
          )}
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <FormProvider {...form}>
            <SignInUpWithCredentials isGlobalScope />
          </FormProvider>
        </StyledContentContainer>
      )}
    </>
  );
};
