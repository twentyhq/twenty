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
  UpdateOneRoleDocument,
} from '~/generated-metadata/graphql';
import { getDirtyFields } from '~/utils/getDirtyFields';

const ROLE_ID = 'role-id';
const SCOPE_ID = 'role-editor';
const PERMISSION_FLAG_KEY = 'APP_SEND_NOTIFICATION';

const setup = ({
  fails = false,
  partialFailure = false,
  refreshFails = false,
} = {}) => {
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
    ...(partialFailure ? { label: 'Updated role' } : {}),
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
              request: { query: UpdateOneRoleDocument, variables: () => true },
              error: new Error('Role update failed'),
            },
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
              ...(refreshFails
                ? { error: new Error('Refresh failed') }
                : {
                    result: {
                      data: { getRoles: [fails ? persistedRole : savedRole] },
                    },
                  }),
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

  it('keeps canonical IDs when adding a flag during save and then undoing it', async () => {
    const { result, store, draftRoleAtom, persistedRoleAtom, savedRole } =
      setup();
    const addedFlag = { id: 'new-id', roleId: ROLE_ID, flag: 'APP_NEW_FLAG' };

    await act(async () => {
      const saving = result.current.saveDraftRoleToDB();
      store.set(draftRoleAtom, (draft) => ({
        ...draft,
        permissionFlags: [...(draft.permissionFlags ?? []), addedFlag],
      }));
      await saving;
    });

    expect(store.get(draftRoleAtom).permissionFlags).toEqual([
      ...savedRole.permissionFlags,
      addedFlag,
    ]);

    act(() => {
      store.set(draftRoleAtom, (draft) => ({
        ...draft,
        permissionFlags: draft.permissionFlags?.filter(
          (permission) => permission.flag !== addedFlag.flag,
        ),
      }));
    });

    expect(
      getDirtyFields(store.get(draftRoleAtom), store.get(persistedRoleAtom)),
    ).toEqual({});
  });

  it('preserves removal of a flag while its save is pending', async () => {
    const { result, store, draftRoleAtom, persistedRoleAtom, savedRole } =
      setup();

    await act(async () => {
      const saving = result.current.saveDraftRoleToDB();
      store.set(draftRoleAtom, (draft) => ({ ...draft, permissionFlags: [] }));
      await saving;
    });

    expect(store.get(persistedRoleAtom)?.permissionFlags).toEqual(
      savedRole.permissionFlags,
    );
    expect(store.get(draftRoleAtom).permissionFlags).toEqual([]);
  });

  it('refreshes successful mutations after a later mutation fails', async () => {
    const { result, store, draftRoleAtom, persistedRoleAtom, savedRole } =
      setup({ partialFailure: true });

    await act(async () => {
      await expect(result.current.saveDraftRoleToDB()).rejects.toThrow(
        'Role update failed',
      );
    });

    expect(store.get(persistedRoleAtom)).toEqual(savedRole);
    expect(store.get(draftRoleAtom).permissionFlags).toEqual(
      savedRole.permissionFlags,
    );
    expect(
      getDirtyFields(store.get(draftRoleAtom), store.get(persistedRoleAtom)),
    ).toEqual({ label: 'Updated role' });
  });

  it('preserves concurrent reversals after a partial save fails', async () => {
    const { result, store, draftRoleAtom, persistedRoleAtom, savedRole } =
      setup({ partialFailure: true });

    await act(async () => {
      const saving = result.current.saveDraftRoleToDB();
      store.set(draftRoleAtom, (draft) => ({
        ...draft,
        label: 'Test role',
        permissionFlags: [],
      }));
      await expect(saving).rejects.toThrow('Role update failed');
    });

    expect(store.get(persistedRoleAtom)).toEqual(savedRole);
    expect(
      getDirtyFields(store.get(draftRoleAtom), store.get(persistedRoleAtom)),
    ).toEqual({ permissionFlags: [] });
  });

  it('preserves the original save error and draft if refreshing also fails', async () => {
    const { result, store, draftRoleAtom, draftRole } = setup({
      fails: true,
      refreshFails: true,
    });

    await act(async () => {
      await expect(result.current.saveDraftRoleToDB()).rejects.toThrow(
        'Save failed',
      );
    });

    expect(store.get(draftRoleAtom)).toEqual(draftRole);
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
