import { render, screen, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { SignInUpSSOExchangeTokenEffect } from '@/auth/sign-in-up/components/internal/SignInUpSSOExchangeTokenEffect';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const redeemSSOExchangeTokenMock = jest.fn();

jest.mock('@/auth/hooks/useRedeemSSOExchangeToken', () => ({
  useRedeemSSOExchangeToken: () => ({
    redeemSSOExchangeToken: redeemSSOExchangeTokenMock,
  }),
}));

const SearchParamsProbe = () => {
  const [searchParams] = useSearchParams();

  return <div data-testid="search-params">{searchParams.toString()}</div>;
};

// StrictMode has to be the outermost element for React to double invoke
// effects: nested under other providers it silently does nothing.
const renderEffect = (initialEntry: string) =>
  render(
    <StrictMode>
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <SignInUpSSOExchangeTokenEffect />
          <SearchParamsProbe />
        </MemoryRouter>
      </JotaiProvider>
    </StrictMode>,
  );

const getSearchParams = () => screen.getByTestId('search-params').textContent;

describe('SignInUpSSOExchangeTokenEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    resetJotaiStore();
  });

  it('redeems the single use token at most once', async () => {
    renderEffect('/sign-in-up?ssoExchangeToken=sso-exchange-token');

    await waitFor(() => {
      expect(redeemSSOExchangeTokenMock).toHaveBeenCalledWith(
        'sso-exchange-token',
      );
    });
    expect(redeemSSOExchangeTokenMock).toHaveBeenCalledTimes(1);
  });

  it('strips the token from the url while keeping returnToPath', async () => {
    renderEffect(
      '/sign-in-up?ssoExchangeToken=sso-exchange-token&returnToPath=%2Fsettings%2Fprofile',
    );

    await waitFor(() => {
      expect(getSearchParams()).toBe('returnToPath=%2Fsettings%2Fprofile');
    });
    expect(redeemSSOExchangeTokenMock).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the url carries no token', () => {
    renderEffect('/sign-in-up');

    expect(redeemSSOExchangeTokenMock).not.toHaveBeenCalled();
    expect(getSearchParams()).toBe('');
  });
});
