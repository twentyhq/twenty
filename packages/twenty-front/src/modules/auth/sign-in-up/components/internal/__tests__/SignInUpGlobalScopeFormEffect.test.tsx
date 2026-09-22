import { render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { SignInUpGlobalScopeFormEffect } from '@/auth/sign-in-up/components/internal/SignInUpGlobalScopeFormEffect';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const navigateAfterMultiWorkspaceSignInUpMock = jest.fn();
const availableWorkspaces = {
  availableWorkspacesForSignIn: [],
  availableWorkspacesForSignUp: [],
};

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    navigateAfterMultiWorkspaceSignInUp:
      navigateAfterMultiWorkspaceSignInUpMock,
  }),
}));

jest.mock('@/auth/hooks/useIsLogged', () => ({
  useIsLogged: () => true,
}));

jest.mock('@/users/hooks/useLoadCurrentUser', () => ({
  useLoadCurrentUser: () => ({
    loadCurrentUser: async () => ({
      user: {
        email: 'person@example.com',
        availableWorkspaces,
      },
    }),
  }),
}));

describe('SignInUpGlobalScopeFormEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('resumes an existing session as a resumed session', async () => {
    jotaiStore.set(signInUpStepState.atom, SignInUpStep.Init);

    render(
      <JotaiProvider store={jotaiStore}>
        <SignInUpGlobalScopeFormEffect />
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(navigateAfterMultiWorkspaceSignInUpMock).toHaveBeenCalledWith(
        availableWorkspaces,
        'person@example.com',
        { isResumingSession: true },
      );
    });
  });
});
