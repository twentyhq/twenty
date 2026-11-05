import { act, render } from '@testing-library/react';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { currentUserState } from '@/auth/states/currentUserState';
import {
  type CurrentUserWorkspace,
  currentUserWorkspaceState,
} from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { IsMinimalMetadataReadyEffect } from '@/metadata-store/effect-components/IsMinimalMetadataReadyEffect';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const LEGACY_CACHED_USER_WORKSPACE = {
  permissionFlags: [],
  twoFactorAuthenticationMethodSummary: [],
  isImpersonating: false,
  objectsPermissions: [],
} as unknown as CurrentUserWorkspace;

const renderEffect = ({
  currentUserWorkspace,
  activationStatus = WorkspaceActivationStatus.ACTIVE,
}: {
  currentUserWorkspace: CurrentUserWorkspace | null;
  activationStatus?: WorkspaceActivationStatus;
}) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(isCookieAuthActiveState.atom, true);
      store.set(currentUserState.atom, mockedUserData);
      store.set(currentUserWorkspaceState.atom, currentUserWorkspace);
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        activationStatus,
      });
      setTestObjectMetadataItemsInMetadataStore(store, []);
      setTestViewsInMetadataStore(store, []);
    },
  });

  render(<IsMinimalMetadataReadyEffect />, { wrapper: Wrapper });
};

describe('IsMinimalMetadataReadyEffect', () => {
  it('is ready when the cached value has records permissions', () => {
    renderEffect({ currentUserWorkspace: mockedUserData.currentUserWorkspace });

    expect(jotaiStore.get(isMinimalMetadataReadyState.atom)).toBe(true);
  });

  it('waits for records permissions when the cached value is in the legacy shape', () => {
    renderEffect({ currentUserWorkspace: LEGACY_CACHED_USER_WORKSPACE });

    expect(jotaiStore.get(isMinimalMetadataReadyState.atom)).toBe(false);

    act(() => {
      jotaiStore.set(
        currentUserWorkspaceState.atom,
        mockedUserData.currentUserWorkspace,
      );
    });

    expect(jotaiStore.get(isMinimalMetadataReadyState.atom)).toBe(true);
  });

  it('does not wait for records permissions on a workspace that is not provisioned', () => {
    renderEffect({
      currentUserWorkspace: null,
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    });

    expect(jotaiStore.get(isMinimalMetadataReadyState.atom)).toBe(true);
  });
});
