import { useSettingsNavigationItems } from '@/settings/hooks/useSettingsNavigationItems';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import {
  Billing,
  OnboardingStatus,
  SettingPermissionType,
} from '~/generated/graphql';

import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

const mockCurrentUser = {
  id: 'fake-user-id',
  email: 'fake@email.com',
  supportUserHash: null,
  canAccessFullAdminPanel: false,
  canImpersonate: false,
  onboardingStatus: OnboardingStatus.COMPLETED,
  userVars: {},
  firstName: 'fake-first-name',
  lastName: 'fake-last-name',
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
      <MemoryRouter>
        <SnackBarProviderScope snackBarManagerScopeId="test-scope-id">
          {children}
        </SnackBarProviderScope>
      </MemoryRouter>
    </RecoilRoot>
  </MockedProvider>
);

jest.mock('@/settings/roles/hooks/useSettingsPermissionMap', () => ({
  useSettingsPermissionMap: jest.fn(),
}));

describe('useSettingsNavigationItems', () => {
  it('should hide workspace settings when no permissions', () => {
    (useSettingsPermissionMap as jest.Mock).mockImplementation(() => ({
      [SettingPermissionType.WORKSPACE]: false,
      [SettingPermissionType.WORKSPACE_MEMBERS]: false,
      [SettingPermissionType.DATA_MODEL]: false,
      [SettingPermissionType.API_KEYS_AND_WEBHOOKS]: false,
      [SettingPermissionType.ROLES]: false,
      [SettingPermissionType.SECURITY]: false,
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
      [SettingPermissionType.WORKSPACE]: true,
      [SettingPermissionType.WORKSPACE_MEMBERS]: true,
      [SettingPermissionType.DATA_MODEL]: true,
      [SettingPermissionType.API_KEYS_AND_WEBHOOKS]: true,
      [SettingPermissionType.ROLES]: true,
      [SettingPermissionType.SECURITY]: true,
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
