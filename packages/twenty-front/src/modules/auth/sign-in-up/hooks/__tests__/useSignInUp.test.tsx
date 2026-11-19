import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Provider as JotaiProvider } from 'jotai';

import { useAuth } from '@/auth/hooks/useAuth';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { type Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { signInUpModeState } from '@/auth/states/signInUpModeState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { SignInUpMode } from '@/auth/types/SignInUpMode';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type PublicWorkspaceData } from '~/generated-metadata/graphql';

jest.mock('@/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace', () => ({
  useIsCurrentLocationOnAWorkspace: () => ({ isOnAWorkspace: true }),
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/captcha/hooks/useGetCaptchaToken', () => ({
  useGetCaptchaToken: () => ({ getCaptchaToken: async () => 'captcha-token' }),
}));

jest.mock(
  '@/domain-manager/hooks/useBuildSearchParamsFromUrlSyncedStates',
  () => ({
    useBuildSearchParamsFromUrlSyncedStates: () => ({
      buildSearchParamsFromUrlSyncedStates: async () => ({}),
    }),
  }),
);

const signUpWithCredentialsMock = jest.fn();
const signUpWithCredentialsInWorkspaceMock = jest.fn();
const checkUserExistsQueryMock = jest.fn();

(useAuth as jest.Mock).mockReturnValue({
  signUpWithCredentialsInWorkspace: signUpWithCredentialsInWorkspaceMock,
  signUpWithCredentials: signUpWithCredentialsMock,
  checkUserExists: { checkUserExistsQuery: checkUserExistsQueryMock },
});

const credentials: Form = {
  email: 'someone@example.com',
  password: 'Passw0rd!',
  exist: false,
  captchaToken: '',
};

const renderUseSignInUp = (workspacePublicData: PublicWorkspaceData | null) => {
  jotaiStore.set(workspacePublicDataState.atom, workspacePublicData);
  jotaiStore.set(signInUpModeState.atom, SignInUpMode.SignUp);

  return renderHook(
    () => useSignInUp(useForm<Form>({ defaultValues: credentials })),
    {
      wrapper: ({ children }) => (
        <JotaiProvider store={jotaiStore}>
          <I18nProvider i18n={i18n}>
            <MemoryRouter>{children}</MemoryRouter>
          </I18nProvider>
        </JotaiProvider>
      ),
    },
  );
};

describe('useSignInUp > submitCredentials > sign-up routing', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('signs up in the workspace when the location resolves one, so its approved access domains are checked', async () => {
    const { result } = renderUseSignInUp({
      id: 'workspace-id',
    } as PublicWorkspaceData);

    await act(() => result.current.submitCredentials(credentials));

    expect(signUpWithCredentialsInWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'someone@example.com',
        password: 'Passw0rd!',
        captchaToken: 'captcha-token',
      }),
    );
    expect(signUpWithCredentialsInWorkspaceMock).toHaveBeenCalledTimes(1);
    expect(signUpWithCredentialsMock).not.toHaveBeenCalled();
  });

  it('signs up without a workspace when the location has none yet', async () => {
    const { result } = renderUseSignInUp(null);

    await act(() => result.current.submitCredentials(credentials));

    expect(signUpWithCredentialsMock).toHaveBeenCalledWith(
      'someone@example.com',
      'Passw0rd!',
      'captcha-token',
    );
    expect(signUpWithCredentialsMock).toHaveBeenCalledTimes(1);
    expect(signUpWithCredentialsInWorkspaceMock).not.toHaveBeenCalled();
  });
});

describe('useSignInUp > continueWithCredentials > errors', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('shows the message the server sent when the check is rejected', async () => {
    checkUserExistsQueryMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [
          {
            message: 'Invalid Captcha: timeout-or-duplicate',
            extensions: {
              userFriendlyMessage: 'Invalid captcha. Please try again.',
            },
          },
        ],
      }),
    );

    const { result } = renderUseSignInUp(null);

    await act(() => result.current.continueWithCredentials());

    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        children: 'Invalid captcha. Please try again.',
      }),
    );
  });

  it('shows a generic message when the request itself fails', async () => {
    checkUserExistsQueryMock.mockRejectedValue(
      new TypeError('Failed to fetch'),
    );

    const { result } = renderUseSignInUp(null);

    await act(() => result.current.continueWithCredentials());

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      status: 'error',
      children: 'An error occurred while checking user existence',
    });
  });
});
