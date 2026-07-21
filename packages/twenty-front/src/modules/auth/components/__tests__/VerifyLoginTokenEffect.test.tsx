import { render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';
import { tokenPairState } from '@/auth/states/tokenPairState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const verifyLoginTokenMock = jest.fn();
const navigateMock = jest.fn();

jest.mock('@/auth/hooks/useVerifyLogin', () => ({
  useVerifyLogin: () => ({ verifyLoginToken: verifyLoginTokenMock }),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigateMock,
}));

const staleTokenPair = {
  accessOrWorkspaceAgnosticToken: {
    token: 'stale-access-token',
    expiresAt: '2020-01-01T00:00:00.000Z',
  },
  refreshToken: {
    token: 'stale-refresh-token',
    expiresAt: '2020-01-01T00:00:00.000Z',
  },
};

const renderEffect = (initialEntry: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <StrictMode>
          <VerifyLoginTokenEffect />
        </StrictMode>
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('VerifyLoginTokenEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    resetJotaiStore();
  });

  it('verifies the login token at most once under StrictMode', async () => {
    renderEffect('/verify?loginToken=login-token');

    await waitFor(() => {
      expect(verifyLoginTokenMock).toHaveBeenCalledWith('login-token');
    });
    expect(verifyLoginTokenMock).toHaveBeenCalledTimes(1);
  });

  it('navigates to sign in up when neither login token nor token pair is present', async () => {
    renderEffect('/verify');

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(AppPath.SignInUp);
    });
    expect(verifyLoginTokenMock).not.toHaveBeenCalled();
  });

  it('keeps the existing token pair when arriving without a login token', () => {
    jotaiStore.set(tokenPairState.atom, staleTokenPair);

    renderEffect('/verify');

    expect(jotaiStore.get(tokenPairState.atom)).toEqual(staleTokenPair);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(verifyLoginTokenMock).not.toHaveBeenCalled();
  });
});
