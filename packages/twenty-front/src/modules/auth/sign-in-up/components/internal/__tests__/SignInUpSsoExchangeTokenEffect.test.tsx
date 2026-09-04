import { render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { BrowserRouter, useSearchParams } from 'react-router-dom';

import { SignInUpSsoExchangeTokenEffect } from '@/auth/sign-in-up/components/internal/SignInUpSsoExchangeTokenEffect';

const redeemSsoExchangeTokenMock = jest.fn();

jest.mock('@/auth/hooks/useRedeemSsoExchangeToken', () => ({
  useRedeemSsoExchangeToken: () => ({
    redeemSsoExchangeToken: redeemSsoExchangeTokenMock,
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
        <SignInUpSsoExchangeTokenEffect />
        <SearchParamsProbe />
      </BrowserRouter>
    </StrictMode>,
  );
};

const getSearchParams = () => screen.getByTestId('search-params').textContent;

describe('SignInUpSsoExchangeTokenEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('redeems the single use token at most once', async () => {
    renderEffect('/sign-in-up#ssoExchangeToken=sso-exchange-token');

    await waitFor(() => {
      expect(redeemSsoExchangeTokenMock).toHaveBeenCalledWith(
        'sso-exchange-token',
      );
    });
    expect(redeemSsoExchangeTokenMock).toHaveBeenCalledTimes(1);
  });

  it('strips the token from the url while keeping returnToPath', async () => {
    renderEffect(
      '/sign-in-up?returnToPath=%2Fsettings%2Fprofile#ssoExchangeToken=sso-exchange-token',
    );

    await waitFor(() => {
      expect(window.location.hash).toBe('');
    });
    expect(getSearchParams()).toBe('returnToPath=%2Fsettings%2Fprofile');
    expect(redeemSsoExchangeTokenMock).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the url carries no token', () => {
    renderEffect('/sign-in-up');

    expect(redeemSsoExchangeTokenMock).not.toHaveBeenCalled();
    expect(getSearchParams()).toBe('');
  });
});
