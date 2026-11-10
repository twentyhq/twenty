import { renderHook } from '@testing-library/react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useReadableNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useReadableNavigationMenuItems';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';

let mockPermissionFlagMap: Partial<Record<PermissionFlagType, boolean>> = {};

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (state: unknown) => {
    if (state === isLayoutCustomizationModeEnabledState) {
      return false;
    }

    return state === permissionFlagMapSelector ? mockPermissionFlagMap : [];
  },
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

  it.each([
    { hasPermissions: false, expectedChildren: [] },
    { hasPermissions: true, expectedChildren: ['workflow', 'agent'] },
  ])(
    'shows workflow and agent pins only with their permissions ($hasPermissions)',
    ({ hasPermissions, expectedChildren }) => {
      mockPermissionFlagMap = {
        [PermissionFlagType.WORKFLOWS]: hasPermissions,
        [PermissionFlagType.AI]: hasPermissions,
      };
      const children = [
        {
          ...FOLDER,
          id: 'workflow',
          folderId: FOLDER.id,
          type: NavigationMenuItemType.WORKFLOW,
          workflowId: 'workflow-id',
        },
        {
          ...FOLDER,
          id: 'agent',
          folderId: FOLDER.id,
          type: NavigationMenuItemType.AGENT,
          agentId: 'agent-id',
        },
      ];
      const { result } = renderHook(() =>
        useReadableNavigationMenuItems({
          topLevelItems: [FOLDER],
          folderChildrenById: new Map([[FOLDER.id, children]]),
        }),
      );

      expect(
        result.current.displayFolderChildrenById
          .get(FOLDER.id)
          ?.map((item) => item.id),
      ).toEqual(expectedChildren);
      expect(result.current.displayTopLevelItems).toEqual(
        hasPermissions ? [FOLDER] : [],
      );
    },
  );
});
