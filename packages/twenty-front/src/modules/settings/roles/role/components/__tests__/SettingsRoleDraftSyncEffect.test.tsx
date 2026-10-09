import { act, render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';

const ROLE_ID = 'role-id';

const PERSISTED_ROLE: RoleWithPartialMembers = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: ROLE_ID,
  label: 'Sales',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
};

const REFRESHED_ROLE: RoleWithPartialMembers = {
  ...PERSISTED_ROLE,
  canUpdateAllObjectRecords: false,
};

const renderEffect = (
  store: ReturnType<typeof createStore>,
  scopeId: string | null,
) =>
  render(
    <JotaiProvider store={store}>
      <RoutedFlowStateScopeContext.Provider value={scopeId}>
        <SettingsRoleDraftSyncEffect roleId={ROLE_ID} />
      </RoutedFlowStateScopeContext.Provider>
    </JotaiProvider>,
  );

describe('SettingsRoleDraftSyncEffect', () => {
  it.each([null, 'role-flow'])(
    'should copy the saved role into an empty draft in scope %s',
    (scopeId) => {
      const store = createStore();
      store.set(
        settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
        PERSISTED_ROLE,
      );

      renderEffect(store, scopeId);

      expect(
        store.get(settingsDraftRoleFamilyState.getAtom(ROLE_ID, scopeId)),
      ).toEqual(PERSISTED_ROLE);
    },
  );

  it('should follow a saved role refreshed while no surface was mounted', () => {
    const store = createStore();
    store.set(
      settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
      PERSISTED_ROLE,
    );

    renderEffect(store, null).unmount();

    store.set(
      settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
      REFRESHED_ROLE,
    );
    renderEffect(store, null);

    expect(store.get(settingsDraftRoleFamilyState.atomFamily(ROLE_ID))).toEqual(
      REFRESHED_ROLE,
    );
  });

  it('should keep unsaved edits when the saved role is refreshed', () => {
    const store = createStore();
    store.set(
      settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
      PERSISTED_ROLE,
    );

    renderEffect(store, null);

    const editedDraftRole = { ...PERSISTED_ROLE, label: 'Edited' };

    act(() => {
      store.set(
        settingsDraftRoleFamilyState.atomFamily(ROLE_ID),
        editedDraftRole,
      );
      store.set(
        settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
        REFRESHED_ROLE,
      );
    });

    expect(store.get(settingsDraftRoleFamilyState.atomFamily(ROLE_ID))).toEqual(
      editedDraftRole,
    );
  });
});
