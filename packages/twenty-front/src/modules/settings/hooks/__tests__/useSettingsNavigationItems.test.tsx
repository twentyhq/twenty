import { useSettingsNavigationItems } from '@/settings/hooks/useSettingsNavigationItems';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import {
  Billing,
  FeatureFlagKey,
  OnboardingStatus,
  SettingsPermissions,
} from '~/generated/graphql';

import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';

const mockCurrentUser = {
  id: 'fake-user-id',
  email: 'fake@email.com',
  supportUserHash: null,
  analyticsTinybirdJwts: null,
  canAccessFullAdminPanel: false,
  canImpersonate: false,
  onboardingStatus: OnboardingStatus.COMPLETED,
  userVars: {},
};

const mockBilling: Billing = {
  isBillingEnabled: false,
  billingUrl: '',
  trialPeriods: [],
  __typename: 'Billing',
};

const initializeState = ({ set }: MutableSnapshot) => {
  set(currentUserState, mockCurrentUser);
  set(billingState, mockBilling);
  set(labPublicFeatureFlagsState, []);
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider>
    <RecoilRoot initializeState={initializeState}>
      <MemoryRouter>{children}</MemoryRouter>
    </RecoilRoot>
  </MockedProvider>
);

jest.mock('@/settings/roles/hooks/useSettingsPermissionMap', () => ({
  useSettingsPermissionMap: jest.fn(),
}));

jest.mock('@/workspace/hooks/useFeatureFlagsMap', () => ({
  useFeatureFlagsMap: () => ({
    [FeatureFlagKey.IsPermissionsEnabled]: true,
  }),
}));

describe('useSettingsNavigationItems', () => {
  it('should hide workspace settings when no permissions', () => {
    (useSettingsPermissionMap as jest.Mock).mockImplementation(() => ({
      [SettingsPermissions.WORKSPACE]: false,
      [SettingsPermissions.WORKSPACE_MEMBERS]: false,
      [SettingsPermissions.DATA_MODEL]: false,
      [SettingsPermissions.API_KEYS_AND_WEBHOOKS]: false,
      [SettingsPermissions.ROLES]: false,
      [SettingsPermissions.SECURITY]: false,
    }));

    const { result } = renderHook(() => useSettingsNavigationItems(), {
      wrapper: Wrapper,
    });

    const workspaceSection = result.current.find(
      (section) => section.label === 'Workspace',
    );

    expect(workspaceSection?.items.every((item) => item.isHidden)).toBe(true);
  });

  it('should show workspace settings when has permissions', () => {
    (useSettingsPermissionMap as jest.Mock).mockImplementation(() => ({
      [SettingsPermissions.WORKSPACE]: true,
      [SettingsPermissions.WORKSPACE_MEMBERS]: true,
      [SettingsPermissions.DATA_MODEL]: true,
      [SettingsPermissions.API_KEYS_AND_WEBHOOKS]: true,
      [SettingsPermissions.ROLES]: true,
      [SettingsPermissions.SECURITY]: true,
    }));

    const { result } = renderHook(() => useSettingsNavigationItems(), {
      wrapper: Wrapper,
    });

    const workspaceSection = result.current.find(
      (section) => section.label === 'Workspace',
    );

    expect(workspaceSection?.items.some((item) => !item.isHidden)).toBe(true);
  });

  it('should show user section items regardless of permissions', () => {
    const { result } = renderHook(() => useSettingsNavigationItems(), {
      wrapper: Wrapper,
    });

    const userSection = result.current.find(
      (section) => section.label === 'User',
    );
    expect(userSection?.items.length).toBeGreaterThan(0);
    expect(userSection?.items.every((item) => !item.isHidden)).toBe(true);
  });
});
