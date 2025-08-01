import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { WorkspaceActivationStatus } from '~/generated/graphql';

// Get any available feature flag for testing (dynamic)
const getFirstFeatureFlag = (): FeatureFlagKey => {
  const flags = Object.values(FeatureFlagKey);
  return flags[0]; // Just use the first available flag
};

const getSecondFeatureFlag = (): FeatureFlagKey => {
  const flags = Object.values(FeatureFlagKey);
  return flags[1] || flags[0]; // Use second flag or fall back to first
};

describe('useIsFeatureEnabled', () => {
  const firstFlag = getFirstFeatureFlag();
  const secondFlag = getSecondFeatureFlag();

  const createMockWorkspaceWithFlag = (
    flag: FeatureFlagKey,
    value: boolean,
  ) => ({
    id: 'test-workspace-id',
    inviteHash: 'test-invite-hash',
    logo: null,
    displayName: 'Test Workspace',
    allowImpersonation: false,
    featureFlags: [
      {
        id: '1',
        key: flag,
        value,
        workspaceId: 'test-workspace-id',
      },
    ],
    activationStatus: WorkspaceActivationStatus.ACTIVE,
    billingSubscriptions: [],
    currentBillingSubscription: null,
    workspaceMembersCount: 1,
    isPublicInviteLinkEnabled: false,
    isGoogleAuthEnabled: false,
    isMicrosoftAuthEnabled: false,
    isPasswordAuthEnabled: true,
    isCustomDomainEnabled: false,
    hasValidEnterpriseKey: false,
    subdomain: 'test-subdomain',
    customDomain: null,
    workspaceUrls: {
      subdomainUrl: 'https://test-subdomain.twenty.com',
      customUrl: null,
    },
    metadataVersion: 1,
    isTwoFactorAuthenticationEnforced: false,
    defaultRole: null,
    defaultAgent: null,
  });

  const createMockWorkspaceWithMultipleFlags = (
    flags: Array<{ flag: FeatureFlagKey; value: boolean }>,
  ) => ({
    id: 'test-workspace-id',
    inviteHash: 'test-invite-hash',
    logo: null,
    displayName: 'Test Workspace',
    allowImpersonation: false,
    featureFlags: flags.map(({ flag, value }, index) => ({
      id: (index + 1).toString(),
      key: flag,
      value,
      workspaceId: 'test-workspace-id',
    })),
    activationStatus: WorkspaceActivationStatus.ACTIVE,
    billingSubscriptions: [],
    currentBillingSubscription: null,
    workspaceMembersCount: 1,
    isPublicInviteLinkEnabled: false,
    isGoogleAuthEnabled: false,
    isMicrosoftAuthEnabled: false,
    isPasswordAuthEnabled: true,
    isCustomDomainEnabled: false,
    hasValidEnterpriseKey: false,
    subdomain: 'test-subdomain',
    customDomain: null,
    workspaceUrls: {
      subdomainUrl: 'https://test-subdomain.twenty.com',
      customUrl: null,
    },
    metadataVersion: 1,
    isTwoFactorAuthenticationEnforced: false,
    defaultRole: null,
    defaultAgent: null,
  });

  const mockWorkspaceWithoutFeatureFlags = {
    id: 'test-workspace-id',
    inviteHash: 'test-invite-hash',
    logo: null,
    displayName: 'Test Workspace',
    allowImpersonation: false,
    featureFlags: [],
    activationStatus: WorkspaceActivationStatus.ACTIVE,
    billingSubscriptions: [],
    currentBillingSubscription: null,
    workspaceMembersCount: 1,
    isPublicInviteLinkEnabled: false,
    isGoogleAuthEnabled: false,
    isMicrosoftAuthEnabled: false,
    isPasswordAuthEnabled: true,
    isCustomDomainEnabled: false,
    hasValidEnterpriseKey: false,
    subdomain: 'test-subdomain',
    customDomain: null,
    workspaceUrls: {
      subdomainUrl: 'https://test-subdomain.twenty.com',
      customUrl: null,
    },
    metadataVersion: 1,
    isTwoFactorAuthenticationEnforced: false,
    defaultRole: null,
    defaultAgent: null,
  };

  it('should return true when feature flag is enabled', () => {
    const mockWorkspace = createMockWorkspaceWithFlag(firstFlag, true);

    const { result } = renderHook(() => useIsFeatureEnabled(firstFlag), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(currentWorkspaceState, mockWorkspace);
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    expect(result.current).toBe(true);
  });

  it('should return false when feature flag is disabled', () => {
    const mockWorkspace = createMockWorkspaceWithFlag(secondFlag, false);

    const { result } = renderHook(() => useIsFeatureEnabled(secondFlag), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(currentWorkspaceState, mockWorkspace);
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    expect(result.current).toBe(false);
  });

  it('should return false when feature flag does not exist in workspace', () => {
    const { result } = renderHook(() => useIsFeatureEnabled(firstFlag), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(
              currentWorkspaceState,
              mockWorkspaceWithoutFeatureFlags,
            );
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    expect(result.current).toBe(false);
  });

  it('should return false when feature key is null', () => {
    const mockWorkspace = createMockWorkspaceWithFlag(firstFlag, true);

    const { result } = renderHook(() => useIsFeatureEnabled(null), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(currentWorkspaceState, mockWorkspace);
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    expect(result.current).toBe(false);
  });

  it('should return false when workspace is null', () => {
    const { result } = renderHook(() => useIsFeatureEnabled(firstFlag), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(currentWorkspaceState, null);
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    expect(result.current).toBe(false);
  });

  it('should handle multiple feature flags correctly', () => {
    const mockWorkspace = createMockWorkspaceWithMultipleFlags([
      { flag: firstFlag, value: true },
      { flag: secondFlag, value: false },
    ]);

    const { result: result1 } = renderHook(
      () => useIsFeatureEnabled(firstFlag),
      {
        wrapper: ({ children }) => (
          <RecoilRoot
            initializeState={(snapshot) => {
              snapshot.set(currentWorkspaceState, mockWorkspace);
            }}
          >
            {children}
          </RecoilRoot>
        ),
      },
    );

    const { result: result2 } = renderHook(
      () => useIsFeatureEnabled(secondFlag),
      {
        wrapper: ({ children }) => (
          <RecoilRoot
            initializeState={(snapshot) => {
              snapshot.set(currentWorkspaceState, mockWorkspace);
            }}
          >
            {children}
          </RecoilRoot>
        ),
      },
    );

    expect(result1.current).toBe(true);
    expect(result2.current).toBe(false);
  });
});
