import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { SignInUpGlobalScopeForm } from '@/auth/sign-in-up/components/SignInUpGlobalScopeForm';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const buildWorkspaceUrlMock = jest.fn();
const signOutMock = jest.fn();
const createWorkspaceMock = jest.fn();

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

jest.mock('@/auth/sign-in-up/components/internal/SignInUpWithSaaS', () => ({
  SignInUpWithSaaS: () => <button>Continue with SmartBiz</button>,
}));

jest.mock('~/utils/image/getAbsoluteImageUrl', () => ({
  getAbsoluteImageUrl: () => '/smartbiz-icon.svg',
}));

dynamicActivate(SOURCE_LOCALE);

describe('SignInUpGlobalScopeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('renders only the SmartBiz sign-in action on the auth screen', () => {
    jotaiStore.set(signInUpStepState.atom, SignInUpStep.Init);

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

    expect(screen.getByText('Continue with SmartBiz')).toBeInTheDocument();
    expect(screen.queryByText('Continue with Email')).not.toBeInTheDocument();
    expect(screen.queryByText('Forgot your password?')).not.toBeInTheDocument();
  });
});
