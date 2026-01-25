import { useSettingsNavigationItems } from '@/settings/hooks/useSettingsNavigationItems';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { type MutableSnapshot, RecoilRoot } from 'recoil';
import { vi } from 'vitest';
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

vi.mock('@/settings/roles/hooks/usePermissionFlagMap', () => ({
  usePermissionFlagMap: vi.fn(),
}));

describe('useSettingsNavigationItems', () => {
  it('should hide workspace settings when no permissions', () => {
    vi.mocked(usePermissionFlagMap).mockImplementation(() => ({
      [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: false,
      [PermissionFlagType.WORKSPACE]: false,
      [PermissionFlagType.WORKSPACE_MEMBERS]: false,
      [PermissionFlagType.ROLES]: false,
      [PermissionFlagType.DATA_MODEL]: false,
      [PermissionFlagType.SECURITY]: false,
      [PermissionFlagType.WORKFLOWS]: false,
      [PermissionFlagType.IMPERSONATE]: false,
      [PermissionFlagType.SSO_BYPASS]: false,
      [PermissionFlagType.APPLICATIONS]: false,
      [PermissionFlagType.LAYOUTS]: false,
      [PermissionFlagType.BILLING]: false,
      [PermissionFlagType.AI_SETTINGS]: false,
      [PermissionFlagType.AI]: false,
      [PermissionFlagType.VIEWS]: false,
      [PermissionFlagType.UPLOAD_FILE]: false,
      [PermissionFlagType.DOWNLOAD_FILE]: false,
      [PermissionFlagType.SEND_EMAIL_TOOL]: false,
      [PermissionFlagType.HTTP_REQUEST_TOOL]: false,
      [PermissionFlagType.CODE_INTERPRETER_TOOL]: false,
      [PermissionFlagType.IMPORT_CSV]: false,
      [PermissionFlagType.EXPORT_CSV]: false,
      [PermissionFlagType.CONNECTED_ACCOUNTS]: false,
      [PermissionFlagType.PROFILE_INFORMATION]: false,
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
    vi.mocked(usePermissionFlagMap).mockImplementation(() => ({
      [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: true,
      [PermissionFlagType.WORKSPACE]: true,
      [PermissionFlagType.WORKSPACE_MEMBERS]: true,
      [PermissionFlagType.ROLES]: true,
      [PermissionFlagType.DATA_MODEL]: true,
      [PermissionFlagType.SECURITY]: true,
      [PermissionFlagType.WORKFLOWS]: true,
      [PermissionFlagType.IMPERSONATE]: true,
      [PermissionFlagType.SSO_BYPASS]: true,
      [PermissionFlagType.APPLICATIONS]: true,
      [PermissionFlagType.LAYOUTS]: true,
      [PermissionFlagType.BILLING]: true,
      [PermissionFlagType.AI_SETTINGS]: true,
      [PermissionFlagType.AI]: true,
      [PermissionFlagType.VIEWS]: true,
      [PermissionFlagType.UPLOAD_FILE]: true,
      [PermissionFlagType.DOWNLOAD_FILE]: true,
      [PermissionFlagType.SEND_EMAIL_TOOL]: true,
      [PermissionFlagType.HTTP_REQUEST_TOOL]: true,
      [PermissionFlagType.CODE_INTERPRETER_TOOL]: true,
      [PermissionFlagType.IMPORT_CSV]: true,
      [PermissionFlagType.EXPORT_CSV]: true,
      [PermissionFlagType.CONNECTED_ACCOUNTS]: true,
      [PermissionFlagType.PROFILE_INFORMATION]: true,
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
