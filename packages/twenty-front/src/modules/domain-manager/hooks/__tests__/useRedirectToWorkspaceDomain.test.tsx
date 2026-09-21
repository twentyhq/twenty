import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { getDefaultStore } from 'jotai';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { isStayOnDefaultDomainRequested } from '@/domain-manager/utils/isStayOnDefaultDomainRequested';
import { rememberStayOnDefaultDomainRequest } from '@/domain-manager/utils/rememberStayOnDefaultDomainRequest';

const redirectSpy = jest.fn();

jest.mock('@/domain-manager/hooks/useRedirect', () => ({
  useRedirect: jest.fn().mockImplementation(() => ({
    redirect: redirectSpy,
  })),
}));

describe('useRedirectToWorkspaceDomain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    getDefaultStore().set(isMultiWorkspaceEnabledState.atom, true);
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');
    rememberStayOnDefaultDomainRequest();
    window.history.replaceState(null, '', '/welcome');
  });

  it('forgets the stay-on-default-domain request once the user lands on a workspace', async () => {
    const { result } = renderHook(() => useRedirectToWorkspaceDomain());

    await act(async () => {
      await result.current.redirectToWorkspaceDomain(
        'https://apple.twenty.com',
      );
    });

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(isStayOnDefaultDomainRequested()).toBe(false);
  });

  it('keeps the request when multi workspace is disabled and no redirect happens', async () => {
    getDefaultStore().set(isMultiWorkspaceEnabledState.atom, false);

    const { result } = renderHook(() => useRedirectToWorkspaceDomain());

    await act(async () => {
      await result.current.redirectToWorkspaceDomain(
        'https://apple.twenty.com',
      );
    });

    expect(redirectSpy).not.toHaveBeenCalled();
    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });
});
