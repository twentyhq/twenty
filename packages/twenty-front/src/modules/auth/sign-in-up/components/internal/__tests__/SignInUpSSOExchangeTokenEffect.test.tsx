import { render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

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

// StrictMode double invokes effects, proving the single use latch holds
const renderEffect = (initialEntry: string) =>
  render(
    <StrictMode>
      <MemoryRouter initialEntries={[initialEntry]}>
        <SignInUpSSOExchangeTokenEffect />
        <SearchParamsProbe />
      </MemoryRouter>
    </StrictMode>,
  );

const getSearchParams = () => screen.getByTestId('search-params').textContent;

describe('SignInUpSSOExchangeTokenEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
