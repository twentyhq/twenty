import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';

import { useAuth } from '@/auth/hooks/useAuth';
import { SignInUpEmailField } from '@/auth/sign-in-up/components/internal/SignInUpEmailField';
import { SignInUpPasswordField } from '@/auth/sign-in-up/components/internal/SignInUpPasswordField';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/internal/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/internal/SignInUpWithMicrosoft';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared/utils';
import {
  HorizontalSeparator,
  IconChevronRight,
  IconPlus,
  Avatar,
} from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useCreateWorkspaceFromWorkspaceList } from '@/auth/sign-in-up/hooks/useCreateWorkspaceFromWorkspaceList';
import { AppPath } from '@/types/AppPath';

const StyledContentContainer = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  min-width: 200px;
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledWorkspaceContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  overflow: hidden;
  width: 100%;
`;

const StyledWorkspaceItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: ${({ theme }) => theme.spacing(15)};
  padding: 0;
  overflow: hidden;

  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
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

export const SignInUpGlobalScopeForm = () => {
  const authProviders = useRecoilValue(authProvidersState);
  const signInUpStep = useRecoilValue(signInUpStepState);
  const availableWorkspaces = useRecoilValue(availableWorkspacesState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();

  const { checkUserExists } = useAuth();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { handleCreateWorkspaceFromWorkspaceList } =
    useCreateWorkspaceFromWorkspaceList();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useRecoilState(signInUpModeState);
  const setAvailableWorkspaces = useSetRecoilState(availableWorkspacesState);
  const theme = useTheme();
  const { t } = useLingui();

  const isRequestingCaptchaToken = useRecoilValue(
    isRequestingCaptchaTokenState,
  );

  const { enqueueSnackBar } = useSnackBar();
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const [showErrors, setShowErrors] = useState(false);

  const { form } = useSignInUpForm();
  const { pathname } = useLocation();

  const { submitCredentials } = useSignInUp(form);

  const handleSubmit = async () => {
    if (isDefined(form?.formState?.errors?.email)) {
      setShowErrors(true);
      return;
    }

    if (signInUpStep === SignInUpStep.Password) {
      await submitCredentials(form.getValues());
      return;
    }

    const token = await readCaptchaToken();
    await checkUserExists.checkUserExistsQuery({
      variables: {
        email: form.getValues('email'),
        captchaToken: token,
      },
      onError: (error) => {
        enqueueSnackBar(`${error.message}`, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: async (data) => {
        requestFreshCaptchaToken();
        const response = data.checkUserExists;

        setAvailableWorkspaces(response.availableWorkspaces);

        if (
          response.exists === false &&
          response.availableWorkspaces.length === 0
        ) {
          setSignInUpMode(SignInUpMode.SignUp);
          setSignInUpStep(SignInUpStep.Password);
          return;
        }

        if (
          response.exists === true &&
          response.availableWorkspaces.length === 1
        ) {
          return await redirectToWorkspaceDomain(
            getWorkspaceUrl(response.availableWorkspaces[0].workspaceUrls),
            pathname,
            { email: form.getValues('email') },
          );
        }

        setSignInUpStep(SignInUpStep.WorkspaceSelection);
      },
    });
  };

  const onEmailChange = (email: string) => {
    if (email !== form.getValues('email')) {
      setSignInUpStep(SignInUpStep.Email);
    }
  };

  return (
    <>
      {signInUpStep === SignInUpStep.WorkspaceSelection &&
        availableWorkspaces.length > 0 && (
          <StyledWorkspaceContainer>
            {availableWorkspaces.map((workspace) => (
              <UndecoratedLink
                key={workspace.id}
                to={buildWorkspaceUrl(
                  getWorkspaceUrl(workspace.workspaceUrls),
                  AppPath.SignInUp,
                  {
                    email: form.getValues('email'),
                  },
                )}
              >
                <StyledWorkspaceItem>
                  <StyledWorkspaceContent>
                    <Avatar
                      placeholder={workspace.displayName || ''}
                      avatarUrl={workspace.logo ?? DEFAULT_WORKSPACE_LOGO}
                      size="lg"
                    />
                    <StyledWorkspaceTextContainer>
                      <StyledWorkspaceName>
                        {workspace.displayName || workspace.id}
                      </StyledWorkspaceName>
                      <StyledWorkspaceUrl>
                        {
                          new URL(getWorkspaceUrl(workspace.workspaceUrls))
                            .hostname
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
            <StyledWorkspaceItem
              onClick={handleCreateWorkspaceFromWorkspaceList}
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
          </StyledWorkspaceContainer>
        )}
      {signInUpStep !== SignInUpStep.WorkspaceSelection && (
        <StyledContentContainer>
          {authProviders.google && (
            <SignInUpWithGoogle action="list-available-workspaces" />
          )}
          {authProviders.microsoft && (
            <SignInUpWithMicrosoft action="list-available-workspaces" />
          )}
          {(authProviders.google || authProviders.microsoft) && (
            <HorizontalSeparator />
          )}
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <FormProvider {...form}>
            <StyledForm onSubmit={form.handleSubmit(handleSubmit)}>
              <SignInUpEmailField
                showErrors={showErrors}
                onInputChange={onEmailChange}
              />
              {signInUpStep === SignInUpStep.Password && (
                <SignInUpPasswordField
                  showErrors={showErrors}
                  signInUpMode={signInUpMode}
                />
              )}
              <MainButton
                disabled={isRequestingCaptchaToken}
                title={
                  signInUpStep === SignInUpStep.Password
                    ? 'Sign Up'
                    : 'Continue'
                }
                type="submit"
                variant={
                  signInUpStep === SignInUpStep.Init ? 'secondary' : 'primary'
                }
                Icon={() => (form.formState.isSubmitting ? <Loader /> : null)}
                fullWidth
              />
            </StyledForm>
          </FormProvider>
        </StyledContentContainer>
      )}
    </>
  );
};
