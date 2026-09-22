import { render } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { isStayOnDefaultDomainRequested } from '@/domain-manager/utils/isStayOnDefaultDomainRequested';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';

const redirectToWorkspaceDomainSpy = jest.fn();

jest.mock('@/domain-manager/hooks/useRedirectToWorkspaceDomain', () => ({
  useRedirectToWorkspaceDomain: jest.fn().mockImplementation(() => ({
    redirectToWorkspaceDomain: redirectToWorkspaceDomainSpy,
  })),
}));

jest.mock('@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain', () => ({
  useGetPublicWorkspaceDataByDomain: jest.fn().mockImplementation(() => ({
    data: undefined,
  })),
}));

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain', () => ({
  useIsCurrentLocationOnDefaultDomain: jest.fn().mockImplementation(() => ({
    isDefaultDomain: true,
  })),
}));

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace', () => ({
  useIsCurrentLocationOnAWorkspace: jest.fn().mockImplementation(() => ({
    isOnAWorkspace: false,
  })),
}));

jest.mock('@/app/hooks/useInitializeQueryParamState', () => ({
  useInitializeQueryParamState: jest.fn().mockImplementation(() => ({
    initializeQueryParamState: jest.fn(),
  })),
}));

describe('WorkspaceProviderEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    getDefaultStore().set(isMultiWorkspaceEnabledState.atom, true);
    getDefaultStore().set(lastAuthenticatedWorkspaceDomainState.atom, {
      workspaceUrl: 'https://apple.twenty.com',
      workspaceId: 'workspace-id',
    });
  });

  it('sends a plain visit to the default domain back to the last workspace', () => {
    window.history.replaceState(null, '', '/welcome');

    render(<WorkspaceProviderEffect />);

    expect(redirectToWorkspaceDomainSpy).toHaveBeenCalledWith(
      'https://apple.twenty.com',
      '/welcome',
      {},
    );
  });

  it('sends a plain visit back to the last workspace after an earlier visit asked to stay', () => {
    sessionStorage.setItem('stayOnDefaultDomain', 'true');
    window.history.replaceState(null, '', '/welcome');

    render(<WorkspaceProviderEffect />);

    expect(redirectToWorkspaceDomainSpy).toHaveBeenCalledWith(
      'https://apple.twenty.com',
      '/welcome',
      {},
    );
  });

  it('stays on the default domain when the visit asked to stay', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');

    render(<WorkspaceProviderEffect />);

    expect(redirectToWorkspaceDomainSpy).not.toHaveBeenCalled();
  });

  it('remembers the request once social SSO drops the url marker', () => {
    window.history.replaceState(null, '', '/welcome?stayOnDefaultDomain=true');

    render(<WorkspaceProviderEffect />);

    window.history.replaceState(null, '', '/welcome');

    expect(isStayOnDefaultDomainRequested()).toBe(true);
  });
});
