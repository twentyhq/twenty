import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';
import { Button } from 'twenty-ui/primitives/input';

import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { SignInUpWithCredentials } from '@/auth/sign-in-up/components/internal/SignInUpWithCredentials';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/internal/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/internal/SignInUpWithMicrosoft';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { getAvailableWorkspacePathAndSearchParams } from '@/auth/utils/availableWorkspacesUtils';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { isNonEmptyString } from '@sniptt/guards';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Separator } from 'twenty-ui/primitives/layout';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import {
  type AvailableWorkspace,
  GetWorkspaceCreationDefaultsDocument,
} from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledWorkspaceContainer = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.lg};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;

  a:focus-visible {
    outline: none;
  }
`;

const StyledWorkspaceItem = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: ${themeCssVariables.spacing[14]};
  justify-content: space-between;
  overflow: hidden;
  padding: 0;
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};
  width: 100%;

  &:hover {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }

  &:active {
    background-color: ${themeCssVariables.background.transparent.light};
  }

  a:focus-visible > & {
    box-shadow: 0 0 0 3px ${themeCssVariables.accent.secondary};
  }
`;

const StyledWorkspaceContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: 0 ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledWorkspaceTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
`;

const StyledWorkspaceLogo = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledWorkspaceName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  padding-bottom: 2px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledWorkspaceUrl = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledChevronIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  transition:
    color calc(${themeCssVariables.animation.duration.fast} * 1s)
      ${EASE_OUT_CSS},
    transform calc(${themeCssVariables.animation.duration.fast} * 1s)
      ${EASE_OUT_CSS};

  ${StyledWorkspaceItem}:hover & {
    color: ${themeCssVariables.font.color.secondary};
    transform: translateX(2px);
  }

  @media (prefers-reduced-motion: reduce) {
    ${StyledWorkspaceItem}:hover & {
      transform: none;
    }
  }
`;

const StyledForgotPasswordLinkContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: ${themeCssVariables.spacing[4]};
`;

export const SignInUpGlobalScopeForm = () => {
  const theme = useTheme();
  const authProviders = useAtomStateValue(authProvidersState);
  const isDDLLocked = useAtomStateValue(isDDLLockedState);
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const setSignInUpStep = useSetAtomState(signInUpStepState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);
  const { t } = useLingui();

  const { form } = useSignInUpForm();
  const { handleResetPassword } = useHandleResetPassword();
  const returnToPath = useAtomStateValue(returnToPathState);

  useQuery(GetWorkspaceCreationDefaultsDocument, {
    skip: signInUpStep !== SignInUpStep.WorkspaceSelection,
  });

  const getAvailableWorkspaceUrl = (availableWorkspace: AvailableWorkspace) => {
    const { pathname, searchParams } = getAvailableWorkspacePathAndSearchParams(
      availableWorkspace,
      { email: form.getValues('email') },
    );

    return buildWorkspaceUrl(
      getWorkspaceUrl(availableWorkspace.workspaceUrls),
      pathname,
      {
        ...searchParams,
        ...(isNonEmptyString(returnToPath) ? { returnToPath } : {}),
      },
    );
  };

  const availableWorkspacesList = [
    ...availableWorkspaces.availableWorkspacesForSignIn,
    ...availableWorkspaces.availableWorkspacesForSignUp,
  ];

  return (
    <>
      {signInUpStep === SignInUpStep.WorkspaceSelection && (
        <StyledOnboardingContentContainer>
          <StyledWorkspaceContainer>
            {availableWorkspacesList.map((availableWorkspace, index) => (
              <OnboardingStepAnimatedItem
                key={availableWorkspace.id}
                index={index}
              >
                <UndecoratedLink
                  to={getAvailableWorkspaceUrl(availableWorkspace)}
                >
                  <StyledWorkspaceItem>
                    <StyledWorkspaceContent>
                      <Avatar
                        name={availableWorkspace.displayName || ''}
                        colorSeed={getWorkspaceAvatarColorSeed(
                          availableWorkspace.displayName,
                        )}
                        src={getAbsoluteImageUrl(
                          availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO,
                        )}
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
              </OnboardingStepAnimatedItem>
            ))}
            {!isDDLLocked && (
              <OnboardingStepAnimatedItem
                index={availableWorkspacesList.length}
              >
                <StyledWorkspaceItem
                  onClick={() =>
                    setSignInUpStep(SignInUpStep.WorkspaceCreation)
                  }
                >
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
              </OnboardingStepAnimatedItem>
            )}
          </StyledWorkspaceContainer>
        </StyledOnboardingContentContainer>
      )}
      {signInUpStep !== SignInUpStep.WorkspaceSelection && (
        <StyledOnboardingContentContainer>
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
            <Separator style={{ marginBlock: themeCssVariables.spacing[3] }} />
          )}
          {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
          <FormProvider {...form}>
            <SignInUpWithCredentials isGlobalScope />
          </FormProvider>
          {signInUpStep === SignInUpStep.Password && (
            <StyledForgotPasswordLinkContainer>
              <Button
                variant="link"
                onClick={handleResetPassword(form.getValues('email'))}
              >
                <Trans>Forgot your password?</Trans>
              </Button>
            </StyledForgotPasswordLinkContainer>
          )}
        </StyledOnboardingContentContainer>
      )}
    </>
  );
};
