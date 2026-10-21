import { createStore } from 'jotai';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import {
  PermissionFlagType,
  WorkspaceActivationStatus,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const buildStore = ({
  permissionFlags,
  activationStatus,
}: {
  permissionFlags: PermissionFlagType[];
  activationStatus: WorkspaceActivationStatus;
}) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    activationStatus,
  });
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags,
    twoFactorAuthenticationMethodSummary: [],
    objectsPermissions: [],
    isImpersonating: false,
  });

  return store;
};

describe('permissionFlagMapSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should map every permission flag to whether the current user has it', () => {
    const store = buildStore({
      permissionFlags: [PermissionFlagType.DATA_MODEL],
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    });

    const permissionFlagMap = store.get(permissionFlagMapSelector.atom);

    expect(Object.keys(permissionFlagMap).sort()).toEqual(
      Object.values(PermissionFlagType).sort(),
    );
    expect(permissionFlagMap[PermissionFlagType.DATA_MODEL]).toBe(true);
    expect(permissionFlagMap[PermissionFlagType.WORKSPACE]).toBe(false);
  });

  it('should deny every flag while the current user workspace is not loaded', () => {
    const store = createStore();

    store.set(currentWorkspaceState.atom, null);
    store.set(currentUserWorkspaceState.atom, null);

    expect(
      Object.values(store.get(permissionFlagMapSelector.atom)).some(
        (hasPermissionFlag) => hasPermissionFlag,
      ),
    ).toBe(false);
  });

  it('should grant the workspace flag only while the workspace is pending creation', () => {
    const store = buildStore({
      permissionFlags: [],
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    });

    const permissionFlagMap = store.get(permissionFlagMapSelector.atom);

    expect(permissionFlagMap[PermissionFlagType.WORKSPACE]).toBe(true);
    expect(permissionFlagMap[PermissionFlagType.ROLES]).toBe(false);
  });
});
