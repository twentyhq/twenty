import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

jest.mock(
  '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems',
  () => ({
    useCreateManyNavigationMenuItems: jest.fn(),
  }),
);
jest.mock(
  '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems',
  () => ({
    useUpdateManyNavigationMenuItems: jest.fn(),
  }),
);
jest.mock(
  '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems',
  () => ({
    useDeleteManyNavigationMenuItems: jest.fn(),
  }),
);
jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData',
  () => ({
    useNavigationMenuItemsData: () => ({
      navigationMenuItems: [],
      workspaceNavigationMenuItems: [],
      currentUserWorkspaceId: 'current-user-workspace',
    }),
  }),
);
jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

describe('useNavigationMenuItemEditController', () => {
  it('keeps simultaneous Favorites mutations separate from Workspace drafts', async () => {
    const createManyNavigationMenuItems = jest.fn().mockResolvedValue([]);
    const updateManyNavigationMenuItems = jest.fn().mockResolvedValue([]);
    const deleteManyNavigationMenuItems = jest.fn().mockResolvedValue([]);
    jest
      .mocked(useCreateManyNavigationMenuItems)
      .mockReturnValue({ createManyNavigationMenuItems });
    jest
      .mocked(useUpdateManyNavigationMenuItems)
      .mockReturnValue({ updateManyNavigationMenuItems });
    jest
      .mocked(useDeleteManyNavigationMenuItems)
      .mockReturnValue({ deleteManyNavigationMenuItems });
    const store = createStore();
    store.set(navigationMenuItemsDraftState.atom, []);
    const { result } = renderHook(
      () => ({
        workspace: useNavigationMenuItemEditController('workspace'),
        favorite: useNavigationMenuItemEditController('favorite'),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <I18nProvider i18n={i18n}>
            <Provider store={store}>{children}</Provider>
          </I18nProvider>
        ),
      },
    );

    let workspaceId = '';
    let favoriteId = '';
    act(() => {
      favoriteId = result.current.favorite.createItem({
        type: NavigationMenuItemType.FOLDER,
        name: 'Personal',
      });
      workspaceId = result.current.workspace.createItem({
        type: NavigationMenuItemType.FOLDER,
        name: 'Team',
      });
    });
    expect(createManyNavigationMenuItems).toHaveBeenCalledTimes(1);
    expect(createManyNavigationMenuItems).toHaveBeenCalledWith([
      expect.objectContaining({
        id: favoriteId,
        userWorkspaceId: 'current-user-workspace',
        name: 'Personal',
      }),
    ]);
    expect(store.get(navigationMenuItemsDraftState.atom)).toEqual([
      expect.objectContaining({
        id: workspaceId,
        userWorkspaceId: undefined,
        name: 'Team',
      }),
    ]);

    await act(async () => {
      await result.current.workspace.updateItem(workspaceId, {
        name: 'Team renamed',
      });
      await result.current.favorite.updateItem(favoriteId, {
        name: 'Personal renamed',
      });
    });
    expect(updateManyNavigationMenuItems).toHaveBeenCalledTimes(1);
    expect(updateManyNavigationMenuItems).toHaveBeenCalledWith([
      { id: favoriteId, update: { name: 'Personal renamed' } },
    ]);
    expect(store.get(navigationMenuItemsDraftState.atom)?.[0].name).toBe(
      'Team renamed',
    );

    await act(async () => {
      await result.current.favorite.deleteItems([favoriteId]);
      await result.current.workspace.deleteItems([workspaceId]);
    });
    expect(deleteManyNavigationMenuItems).toHaveBeenCalledTimes(1);
    expect(deleteManyNavigationMenuItems).toHaveBeenCalledWith([favoriteId]);
    expect(store.get(navigationMenuItemsDraftState.atom)).toEqual([]);
  });
});
