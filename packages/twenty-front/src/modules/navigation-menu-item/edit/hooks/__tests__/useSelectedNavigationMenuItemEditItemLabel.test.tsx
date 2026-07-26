import { renderHook } from '@testing-library/react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemLabel } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItemLabel';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

jest.mock(
  '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem',
);
jest.mock(
  '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata',
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => [],
}));

const mockUseSelectedItem = jest.mocked(useSelectedNavigationMenuItemEditItem);
const mockUseSelectedItemObjectMetadata = jest.mocked(
  useSelectedNavigationMenuItemEditItemObjectMetadata,
);

const setSelectedItem = (item: Partial<NavigationMenuItem> | undefined) => {
  mockUseSelectedItem.mockReturnValue({
    selectedItem: item as NavigationMenuItem | undefined,
  });
  // PAGE_LAYOUT and LINK items are never backed by object metadata
  mockUseSelectedItemObjectMetadata.mockReturnValue({
    selectedItemObjectMetadata: null,
  });
};

describe('useSelectedNavigationMenuItemEditItemLabel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // The edit side panel refuses to render its organize actions (including
  // "Remove from sidebar") when this label is empty, so an empty label for a
  // valid item makes the item impossible to remove.
  it('should return the item name when the item is a page layout', () => {
    setSelectedItem({
      id: 'page-layout-item-id',
      type: NavigationMenuItemType.PAGE_LAYOUT,
      name: 'Star History',
    });

    const { result } = renderHook(() =>
      useSelectedNavigationMenuItemEditItemLabel(),
    );

    expect(result.current.selectedItemLabel).toBe('Star History');
  });

  it('should return a fallback label when the page layout item has no name', () => {
    setSelectedItem({
      id: 'page-layout-item-id',
      type: NavigationMenuItemType.PAGE_LAYOUT,
      name: null,
    });

    const { result } = renderHook(() =>
      useSelectedNavigationMenuItemEditItemLabel(),
    );

    expect(result.current.selectedItemLabel).toBe('Page');
  });

  it('should return the item name when the item is a link', () => {
    setSelectedItem({
      id: 'link-item-id',
      type: NavigationMenuItemType.LINK,
      name: 'Twenty',
    });

    const { result } = renderHook(() =>
      useSelectedNavigationMenuItemEditItemLabel(),
    );

    expect(result.current.selectedItemLabel).toBe('Twenty');
  });

  it('should return null when no item is selected', () => {
    setSelectedItem(undefined);

    const { result } = renderHook(() =>
      useSelectedNavigationMenuItemEditItemLabel(),
    );

    expect(result.current.selectedItemLabel).toBeNull();
  });
});
