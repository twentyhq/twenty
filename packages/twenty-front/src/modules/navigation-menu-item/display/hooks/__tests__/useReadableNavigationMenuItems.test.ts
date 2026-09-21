import { renderHook } from '@testing-library/react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useReadableNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useReadableNavigationMenuItems';

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (state: unknown) =>
    state === isLayoutCustomizationModeEnabledState ? false : [],
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
});
