import { renderHook } from '@testing-library/react';
import {
  useIsNotLoggedIn,
  useGetUserEmailFromToken,
} from '../AuthenticationHooks';
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
    const { result } = renderHook(() => useIsNotLoggedIn());
    const isNotLoggedIn = result.current;

    expect(isNotLoggedIn).toBe(false);
  });
});

describe('useGetUserEmailFromToken', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.resetModules();
  });

  it('returns undefined if token is not there', () => {
    const { result } = renderHook(() => useGetUserEmailFromToken());
    const email = result.current;

    expect(email).toBe(undefined);
  });

  it('returns email if token is there', () => {
    window.localStorage.setItem(
      'accessToken',
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1FQXZiR0dFNjJ4S25mTFNxNHQ0dCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsidXNlciJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtdXNlci1lbWFpbCI6ImNoYXJsZXNAb3VpaGVscC50d2VudHkuY29tIiwieC1oYXN1cmEtdXNlci1pZCI6Imdvb2dsZS1vYXV0aDJ8MTE4MjM1ODk3NDQ2OTIwNTQ3NzMzIn0sImlzcyI6Imh0dHBzOi8vdHdlbnR5LWRldi5ldS5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTgyMzU4OTc0NDY5MjA1NDc3MzMiLCJhdWQiOlsiaGFzdXJhLWRldiIsImh0dHBzOi8vdHdlbnR5LWRldi5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjc1MzYyNzY0LCJleHAiOjE2NzU0NDkxNjQsImF6cCI6IlM2ZXoyUFdUdUFsRncydjdxTFBWb2hmVXRseHc4QlBhIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCJ9.DseeSqYzNlYVQfuicoK8fK1Z6b-TYNvCkRoXXYOhg1X3HDSejowUTudyrJGErkT65xMCfx8K5quof9eV8BZQixCPr670r5gAIHxHuGY_KNfHTOALe8E5VyQaoekRyDr99Qo3QxliOOlJxtmckA8FTeD6JanfVmcrqghUOIsSXXDOOzJV6eME7JErEjTQHpfxveSVbPlCmIqZ3fqDaFdKfAlUDZFhVQM8XbfubNmG4VcoMyB7H47yLdGkYvVfPO1lVg0efywQo4IfbtiqFv5CjOEqO6PG78Wfkd24bcilkf6ZuGXsA-w-0xlU089GhKF99lNI1PxvNWAaLFbqanxiEw',
    );
    const { result } = renderHook(() => useGetUserEmailFromToken());

    expect(result.current).toBe('charles@ouihelp.twenty.com');
  });
});
