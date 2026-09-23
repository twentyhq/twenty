import { SettingsRoleEditEffect } from '@/settings/roles/role/components/SettingsRoleEditEffect';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import {
  GetRolesDocument,
  UpsertPermissionFlagsDocument,
} from '~/generated-metadata/graphql';
import { getDirtyFields } from '~/utils/getDirtyFields';

const ROLE_ID = 'role-id';
const SCOPE_ID = 'role-editor';
const PERMISSION_FLAG_KEY = 'APP_SEND_NOTIFICATION';

const setup = ({ fails = false } = {}) => {
  const store = createStore();
  const draftRoleAtom = settingsDraftRoleFamilyState.getAtom(ROLE_ID, SCOPE_ID);
  const persistedRoleAtom =
    settingsPersistedRoleFamilyState.atomFamily(ROLE_ID);
  const persistedRole = {
    ...store.get(draftRoleAtom),
    id: ROLE_ID,
    label: 'Test role',
    isEditable: true,
  };
  const draftRole = {
    ...persistedRole,
    permissionFlags: [
      { id: 'temporary-id', roleId: ROLE_ID, flag: PERMISSION_FLAG_KEY },
    ],
  };
  const savedRole = {
    ...persistedRole,
    permissionFlags: [
      {
        __typename: 'RolePermissionFlag' as const,
        id: 'server-id',
        roleId: ROLE_ID,
        flag: PERMISSION_FLAG_KEY,
      },
    ],
  };

  store.set(persistedRoleAtom, persistedRole);
  store.set(draftRoleAtom, draftRole);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <RoutedFlowStateScopeContext.Provider value={SCOPE_ID}>
        <MockedProvider
          mocks={[
            {
              request: {
                query: UpsertPermissionFlagsDocument,
                variables: {
                  upsertPermissionFlagsInput: {
                    roleId: ROLE_ID,
                    permissionFlagKeys: [PERMISSION_FLAG_KEY],
                  },
                },
              },
              ...(fails
                ? { error: new Error('Save failed') }
                : {
                    result: {
                      data: {
                        upsertPermissionFlags: savedRole.permissionFlags,
                      },
                    },
                  }),
            },
            {
              request: { query: GetRolesDocument },
              result: { data: { getRoles: [savedRole] } },
              maxUsageCount: 2,
            },
          ]}
        >
          <>
            <SettingsRoleEditEffect roleId={ROLE_ID} />
            {children}
          </>
        </MockedProvider>
      </RoutedFlowStateScopeContext.Provider>
    </Provider>
  );

  const { result } = renderHook(
    () => useSaveDraftRoleToDB({ roleId: ROLE_ID, isCreateMode: false }),
    { wrapper },
  );

  return {
    result,
    store,
    draftRoleAtom,
    persistedRoleAtom,
    draftRole,
    savedRole,
  };
};

describe('useSaveDraftRoleToDB', () => {
  it('clears unsaved changes after saving flags with server-generated IDs', async () => {
    const { result, store, draftRoleAtom, persistedRoleAtom, savedRole } =
      setup();

    await act(async () => {
      await result.current.saveDraftRoleToDB();
    });

    expect(store.get(draftRoleAtom).permissionFlags).toEqual(
      savedRole.permissionFlags,
    );
    expect(
      getDirtyFields(store.get(draftRoleAtom), store.get(persistedRoleAtom)),
    ).toEqual({});
  });

  it('preserves edits made while the save is pending', async () => {
    const { result, store, draftRoleAtom, persistedRoleAtom, savedRole } =
      setup();

    await act(async () => {
      const saving = result.current.saveDraftRoleToDB();
      store.set(draftRoleAtom, {
        ...store.get(draftRoleAtom),
        label: 'Edited during save',
      });
      await saving;
    });

    expect(store.get(draftRoleAtom).permissionFlags).toEqual(
      savedRole.permissionFlags,
    );
    expect(
      getDirtyFields(store.get(draftRoleAtom), store.get(persistedRoleAtom)),
    ).toEqual({
      label: 'Edited during save',
    });
  });

  it('keeps the draft dirty when saving fails', async () => {
    const { result, store, draftRoleAtom, persistedRoleAtom, draftRole } =
      setup({ fails: true });

    await act(async () => {
      await expect(result.current.saveDraftRoleToDB()).rejects.toThrow(
        'Save failed',
      );
    });

    expect(store.get(draftRoleAtom)).toEqual(draftRole);
    expect(
      getDirtyFields(store.get(draftRoleAtom), store.get(persistedRoleAtom)),
    ).toEqual({
      permissionFlags: draftRole.permissionFlags,
    });
  });
});
