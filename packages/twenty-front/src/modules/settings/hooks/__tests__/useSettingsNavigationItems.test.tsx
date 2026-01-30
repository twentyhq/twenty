import { useSettingsNavigationItems } from '@/settings/hooks/useSettingsNavigationItems';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { type MutableSnapshot, RecoilRoot } from 'recoil';
import {
  type Billing,
  OnboardingStatus,
  PermissionFlagType,
} from '~/generated/graphql';

import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { messages } from '~/locales/generated/en';

i18n.load({
  [SOURCE_LOCALE]: messages,
});
i18n.activate(SOURCE_LOCALE);

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
  hasPassword: true,
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
        <I18nProvider i18n={i18n}>
          <SnackBarComponentInstanceContext.Provider
            value={{ instanceId: 'test-scope-id' }}
          >
            {children}
          </SnackBarComponentInstanceContext.Provider>
        </I18nProvider>
      </MemoryRouter>
    </RecoilRoot>
  </MockedProvider>
);

jest.mock('@/settings/roles/hooks/usePermissionFlagMap', () => ({
  usePermissionFlagMap: jest.fn(),
}));

describe('useSettingsNavigationItems', () => {
  it('should hide workspace settings when no permissions', () => {
    (usePermissionFlagMap as jest.Mock).mockImplementation(() => ({
      [PermissionFlagType.WORKSPACE]: false,
      [PermissionFlagType.WORKSPACE_MEMBERS]: false,
      [PermissionFlagType.DATA_MODEL]: false,
      [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: false,
      [PermissionFlagType.ROLES]: false,
      [PermissionFlagType.SECURITY]: false,
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
    (usePermissionFlagMap as jest.Mock).mockImplementation(() => ({
      [PermissionFlagType.WORKSPACE]: true,
      [PermissionFlagType.WORKSPACE_MEMBERS]: true,
      [PermissionFlagType.DATA_MODEL]: true,
      [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: true,
      [PermissionFlagType.ROLES]: true,
      [PermissionFlagType.SECURITY]: true,
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
