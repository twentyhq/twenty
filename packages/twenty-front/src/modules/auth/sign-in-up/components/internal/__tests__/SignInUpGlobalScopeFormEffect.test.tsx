import { act, render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { SignInUpGlobalScopeFormEffect } from '@/auth/sign-in-up/components/internal/SignInUpGlobalScopeFormEffect';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
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

const renderEffect = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <SignInUpGlobalScopeFormEffect />
    </JotaiProvider>,
  );

describe('SignInUpGlobalScopeFormEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(signInUpStepState.atom, SignInUpStep.Init);
  });

  it('resumes an existing session as a resumed session', async () => {
    jotaiStore.set(isCookieAuthActiveState.atom, true);

    renderEffect();

    await waitFor(() => {
      expect(navigateAfterMultiWorkspaceSignInUpMock).toHaveBeenCalledTimes(1);
    });
    expect(navigateAfterMultiWorkspaceSignInUpMock).toHaveBeenCalledWith(
      availableWorkspaces,
      'person@example.com',
      { isResumingSession: true },
    );
  });

  it('treats a session that social SSO starts on the page as a sign-in', async () => {
    jotaiStore.set(isCookieAuthActiveState.atom, false);

    renderEffect();

    act(() => {
      jotaiStore.set(isCookieAuthActiveState.atom, true);
    });

    await waitFor(() => {
      expect(navigateAfterMultiWorkspaceSignInUpMock).toHaveBeenCalledTimes(1);
    });
    expect(navigateAfterMultiWorkspaceSignInUpMock).toHaveBeenCalledWith(
      availableWorkspaces,
      'person@example.com',
      { isResumingSession: false },
    );
  });
});
