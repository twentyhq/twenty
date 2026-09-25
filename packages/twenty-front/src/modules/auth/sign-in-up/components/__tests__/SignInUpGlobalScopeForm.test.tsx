import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme';

import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { SignInUpGlobalScopeForm } from '@/auth/sign-in-up/components/SignInUpGlobalScopeForm';
import { isStayingOnDefaultDomainState } from '@/domain-manager/states/isStayingOnDefaultDomainState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const buildWorkspaceUrlMock = jest.fn();
const signOutMock = jest.fn();
const createWorkspaceMock = jest.fn();
const handleResetPasswordMock = jest.fn();
const resetPasswordClickMock = jest.fn();

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    signOut: signOutMock,
  }),
}));

jest.mock('@/domain-manager/hooks/useBuildWorkspaceUrl', () => ({
  useBuildWorkspaceUrl: () => ({
    buildWorkspaceUrl: buildWorkspaceUrlMock,
  }),
}));

jest.mock('@/auth/sign-in-up/hooks/useSignUpInNewWorkspace', () => ({
  useSignUpInNewWorkspace: () => ({
    createWorkspace: createWorkspaceMock,
  }),
}));

jest.mock('@/auth/sign-in-up/hooks/useSignInUpForm', () => ({
  useSignInUpForm: () => ({
    form: {
      getValues: () => 'person@example.com',
    },
  }),
}));

jest.mock('@/auth/sign-in-up/hooks/useHandleResetPassword', () => ({
  useHandleResetPassword: () => ({
    handleResetPassword: handleResetPasswordMock,
  }),
}));

jest.mock(
  '@/auth/sign-in-up/components/internal/SignInUpWithCredentials',
  () => ({
    SignInUpWithCredentials: () => <div>credentials-form</div>,
  }),
);

jest.mock('@/auth/sign-in-up/components/internal/SignInUpWithGoogle', () => ({
  SignInUpWithGoogle: () => null,
}));

jest.mock(
  '@/auth/sign-in-up/components/internal/SignInUpWithMicrosoft',
  () => ({
    SignInUpWithMicrosoft: () => null,
  }),
);

dynamicActivate(SOURCE_LOCALE);

describe('SignInUpGlobalScopeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    handleResetPasswordMock.mockReturnValue(resetPasswordClickMock);
  });

  it('renders forgot-password link on password step and triggers reset callback', () => {
    jotaiStore.set(signInUpStepState.atom, SignInUpStep.Password);
    jotaiStore.set(authProvidersState.atom, {
      google: false,
      magicLink: false,
      microsoft: false,
      password: true,
      sso: [],
    });

    render(
      <MockedProvider mocks={[]}>
        <JotaiProvider store={jotaiStore}>
          <ThemeProvider colorScheme="light">
            <I18nProvider i18n={i18n}>
              <SignInUpGlobalScopeForm />
            </I18nProvider>
          </ThemeProvider>
        </JotaiProvider>
      </MockedProvider>,
    );

    const forgotPasswordLink = screen.getByText('Forgot your password?');

    expect(forgotPasswordLink).toBeInTheDocument();
    expect(handleResetPasswordMock).toHaveBeenCalledWith('person@example.com');

    fireEvent.click(forgotPasswordLink);

    expect(resetPasswordClickMock).toHaveBeenCalledTimes(1);
  });
  it('forgets the stay-on-default-domain request when a workspace is picked', () => {
    jotaiStore.set(isStayingOnDefaultDomainState.atom, true);
    buildWorkspaceUrlMock.mockReturnValue('https://apple.twenty.com/verify');
    jotaiStore.set(signInUpStepState.atom, SignInUpStep.WorkspaceSelection);
    jotaiStore.set(availableWorkspacesState.atom, {
      availableWorkspacesForSignIn: [
        {
          id: 'workspace-id',
          displayName: 'Apple',
          loginToken: 'login-token',
          inviteHash: null,
          personalInviteToken: null,
          logo: null,
          sso: [],
          workspaceUrls: {
            subdomainUrl: 'https://apple.twenty.com',
            customUrl: null,
          },
        },
      ],
      availableWorkspacesForSignUp: [],
    });

    render(
      <MockedProvider mocks={[]}>
        <JotaiProvider store={jotaiStore}>
          <ThemeProvider colorScheme="light">
            <I18nProvider i18n={i18n}>
              <MemoryRouter>
                <SignInUpGlobalScopeForm />
              </MemoryRouter>
            </I18nProvider>
          </ThemeProvider>
        </JotaiProvider>
      </MockedProvider>,
    );

    fireEvent.click(screen.getByText('Apple'));

    expect(jotaiStore.get(isStayingOnDefaultDomainState.atom)).toBe(false);
  });
});
