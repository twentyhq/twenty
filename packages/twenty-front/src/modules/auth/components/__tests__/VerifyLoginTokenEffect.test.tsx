import { act, render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
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

jest.mock('@/auth/hooks/useHasAccessTokenPair', () => ({
  useHasAccessTokenPair: () => false,
}));

const setClientConfigSaved = (isSaved: boolean) => {
  jotaiStore.set(clientConfigApiStatusState.atom, {
    isLoadedOnce: true,
    isLoading: false,
    isErrored: false,
    isSaved,
  });
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
    resetJotaiStore();
    setClientConfigSaved(true);
  });

  it('verifies the login token at most once even when the gating config re-triggers the effect', async () => {
    renderEffect('/verify?loginToken=login-token');

    await waitFor(() => {
      expect(verifyLoginTokenMock).toHaveBeenCalledWith('login-token');
    });
    expect(verifyLoginTokenMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      setClientConfigSaved(false);
    });
    await act(async () => {
      setClientConfigSaved(true);
    });

    expect(verifyLoginTokenMock).toHaveBeenCalledTimes(1);
  });
});
