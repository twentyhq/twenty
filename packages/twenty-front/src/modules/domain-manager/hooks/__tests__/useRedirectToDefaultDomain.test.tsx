import { renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';

const redirectSpy = jest.fn();
const setLastAuthenticateWorkspaceDomainSpy = jest.fn();

jest.mock('@/domain-manager/hooks/useRedirect', () => ({
  useRedirect: jest.fn().mockImplementation(() => ({
    redirect: redirectSpy,
  })),
}));

jest.mock('@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain', () => ({
  useLastAuthenticatedWorkspaceDomain: jest.fn().mockImplementation(() => ({
    setLastAuthenticateWorkspaceDomain: setLastAuthenticateWorkspaceDomainSpy,
  })),
}));

const getRedirectedUrl = () => new URL(redirectSpy.mock.calls[0]?.[0]);

describe('useRedirectToDefaultDomain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDefaultStore().set(isMultiWorkspaceEnabledState.atom, true);
    getDefaultStore().set(domainConfigurationState.atom, {
      frontDomain: 'twenty.com',
      defaultSubdomain: 'app',
      publicFunctionDomain: undefined,
    });
    window.history.replaceState(null, '', '/welcome');
  });

  it('forgets the last authenticated workspace and asks the default domain not to redirect back', () => {
    const { result } = renderHook(() => useRedirectToDefaultDomain());

    result.current.redirectToDefaultDomain();

    expect(setLastAuthenticateWorkspaceDomainSpy).toHaveBeenCalledTimes(1);
    expect(setLastAuthenticateWorkspaceDomainSpy).toHaveBeenCalledWith(null);

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    const url = getRedirectedUrl();
    expect(url.hostname).toBe('app.twenty.com');
    expect(url.searchParams.get('stayOnDefaultDomain')).toBe('true');
  });

  it('keeps the search params given by the caller', () => {
    const { result } = renderHook(() => useRedirectToDefaultDomain());

    result.current.redirectToDefaultDomain({
      pathname: '/welcome',
      searchParams: { action: 'create-new-workspace' },
    });

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    const url = getRedirectedUrl();
    expect(url.searchParams.get('action')).toBe('create-new-workspace');
    expect(url.searchParams.get('stayOnDefaultDomain')).toBe('true');
  });

  it('leaves the default domain free to redirect when the caller opts out of staying', () => {
    const { result } = renderHook(() => useRedirectToDefaultDomain());

    result.current.redirectToDefaultDomain({
      shouldStayOnDefaultDomain: false,
    });

    expect(setLastAuthenticateWorkspaceDomainSpy).toHaveBeenCalledWith(null);
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    const url = getRedirectedUrl();
    expect(url.hostname).toBe('app.twenty.com');
    expect(url.searchParams.has('stayOnDefaultDomain')).toBe(false);
  });

  it('does nothing when already on the default domain', () => {
    getDefaultStore().set(domainConfigurationState.atom, {
      frontDomain: 'localhost',
      defaultSubdomain: undefined,
      publicFunctionDomain: undefined,
    });
    getDefaultStore().set(isMultiWorkspaceEnabledState.atom, false);

    const { result } = renderHook(() => useRedirectToDefaultDomain());

    result.current.redirectToDefaultDomain();

    expect(redirectSpy).not.toHaveBeenCalled();
    expect(setLastAuthenticateWorkspaceDomainSpy).not.toHaveBeenCalled();
  });
});
