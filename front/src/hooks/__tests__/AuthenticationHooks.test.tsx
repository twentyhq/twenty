import { renderHook } from '@testing-library/react';
import AuthenticationHooks from '../AuthenticationHooks';
import { useAuth0 } from '@auth0/auth0-react';
import { mocked } from 'jest-mock';

jest.mock('@auth0/auth0-react');
const mockedUseAuth0 = mocked(useAuth0, true);

const user = {
  email: 'johndoe@me.com',
  email_verified: true,
  sub: 'google-oauth2|12345678901234',
};

describe('useIsNotLoggedIn', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.resetModules();
  });

  it('returns false if auth0 is loading', () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: false,
      user,
      logout: jest.fn(),
      loginWithRedirect: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
      isLoading: true,
    });

    const { useIsNotLoggedIn } = AuthenticationHooks;
    const { result } = renderHook(() => useIsNotLoggedIn());
    const isNotLoggedIn = result.current;

    expect(isNotLoggedIn).toBe(false);
  });

  it('returns false if token is not there', () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: false,
      user,
      logout: jest.fn(),
      loginWithRedirect: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
      isLoading: false,
    });

    const { useIsNotLoggedIn } = AuthenticationHooks;
    const { result } = renderHook(() => useIsNotLoggedIn());
    const isNotLoggedIn = result.current;

    expect(isNotLoggedIn).toBe(true);
  });

  it('returns false if token is there but user is not connected on auth0', () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: false,
      user,
      logout: jest.fn(),
      loginWithRedirect: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
      isLoading: false,
    });

    window.localStorage.setItem('accessToken', 'token');
    const { useIsNotLoggedIn } = AuthenticationHooks;
    const { result } = renderHook(() => useIsNotLoggedIn());
    const isNotLoggedIn = result.current;

    expect(isNotLoggedIn).toBe(true);
  });

  it('returns false if token is there and user is connected on auth0', () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: true,
      user,
      logout: jest.fn(),
      loginWithRedirect: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
      isLoading: false,
    });

    window.localStorage.setItem('accessToken', 'token');
    const { useIsNotLoggedIn } = AuthenticationHooks;
    const { result } = renderHook(() => useIsNotLoggedIn());
    const isNotLoggedIn = result.current;

    expect(isNotLoggedIn).toBe(false);
  });
});
