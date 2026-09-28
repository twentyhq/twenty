import { renderHook } from '@testing-library/react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useReadableNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useReadableNavigationMenuItems';

let mockIsLayoutCustomizationModeEnabled = false;

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (state: unknown) =>
    state === isLayoutCustomizationModeEnabledState
      ? mockIsLayoutCustomizationModeEnabled
      : [],
}));
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));

const FOLDER: NavigationMenuItem = {
  id: 'folder',
  type: NavigationMenuItemType.FOLDER,
  name: 'New folder',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

describe('useReadableNavigationMenuItems', () => {
  afterEach(() => {
    mockIsLayoutCustomizationModeEnabled = false;
  });

  it('keeps empty Favorites folders visible for renaming and adding items', () => {
    const folder = { ...FOLDER, userWorkspaceId: 'user-workspace' };
    const { result } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [folder],
        folderChildrenById: new Map(),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([folder]);
  });

  it('continues hiding empty workspace folders outside customization', () => {
    const { result } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [FOLDER],
        folderChildrenById: new Map(),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([]);
  });

  it('keeps the Favorites folder without exposing unreadable children', () => {
    const folder = { ...FOLDER, userWorkspaceId: 'user-workspace' };
    const unreadableItem = {
      ...FOLDER,
      id: 'object',
      folderId: folder.id,
      type: NavigationMenuItemType.OBJECT,
      targetObjectMetadataId: 'inaccessible',
    };
    const { result } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [folder],
        folderChildrenById: new Map([[folder.id, [unreadableItem]]]),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([folder]);
    expect(result.current.displayFolderChildrenById.get(folder.id)).toEqual([]);
  });

  describe('with a divider at the end of a folder', () => {
    const LINK = {
      ...FOLDER,
      id: 'link',
      folderId: FOLDER.id,
      type: NavigationMenuItemType.LINK,
      link: 'https://twenty.com',
    };
    const DIVIDER = {
      ...FOLDER,
      id: 'divider',
      folderId: FOLDER.id,
      type: NavigationMenuItemType.DIVIDER,
      name: null,
      position: 1,
    };
    const folderChildrenById = new Map([[FOLDER.id, [LINK, DIVIDER]]]);

    it('drops it outside customization so the folder tree line closes', () => {
      const { result } = renderHook(() =>
        useReadableNavigationMenuItems({
          topLevelItems: [FOLDER],
          folderChildrenById,
        }),
      );
      expect(result.current.displayFolderChildrenById.get(FOLDER.id)).toEqual([
        LINK,
      ]);
    });

    it('keeps it during customization so it can be moved or removed', () => {
      mockIsLayoutCustomizationModeEnabled = true;
      const { result } = renderHook(() =>
        useReadableNavigationMenuItems({
          topLevelItems: [FOLDER],
          folderChildrenById,
        }),
      );
      expect(result.current.displayFolderChildrenById.get(FOLDER.id)).toEqual([
        LINK,
        DIVIDER,
      ]);
    });
  });
});
