import { render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { BrowserRouter, useSearchParams } from 'react-router-dom';

import { SignInUpSSOExchangeTokenEffect } from '@/auth/sign-in-up/components/internal/SignInUpSSOExchangeTokenEffect';

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

// BrowserRouter because the effect reads and strips window.location, which
// MemoryRouter never touches
const renderEffect = (initialUrl: string) => {
  window.history.replaceState(null, '', initialUrl);

  return render(
    <StrictMode>
      <BrowserRouter>
        <SignInUpSSOExchangeTokenEffect />
        <SearchParamsProbe />
      </BrowserRouter>
    </StrictMode>,
  );
};

const getSearchParams = () => screen.getByTestId('search-params').textContent;

describe('SignInUpSSOExchangeTokenEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('redeems the single use token at most once', async () => {
    renderEffect('/sign-in-up#ssoExchangeToken=sso-exchange-token');

    await waitFor(() => {
      expect(redeemSSOExchangeTokenMock).toHaveBeenCalledWith(
        'sso-exchange-token',
      );
    });
    expect(redeemSSOExchangeTokenMock).toHaveBeenCalledTimes(1);
  });

  it('strips the token from the url while keeping returnToPath', async () => {
    renderEffect(
      '/sign-in-up?returnToPath=%2Fsettings%2Fprofile#ssoExchangeToken=sso-exchange-token',
    );

    await waitFor(() => {
      expect(window.location.hash).toBe('');
    });
    expect(getSearchParams()).toBe('returnToPath=%2Fsettings%2Fprofile');
    expect(redeemSSOExchangeTokenMock).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the url carries no token', () => {
    renderEffect('/sign-in-up');

    expect(redeemSSOExchangeTokenMock).not.toHaveBeenCalled();
    expect(getSearchParams()).toBe('');
  });
});
