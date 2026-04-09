import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { renderHook } from '@testing-library/react';
import { IconPlus } from 'twenty-ui/display';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';

const MockComponent = <div>Mock Component</div>;

describe('useFilterCommandMenuItemsWithSidePanelSearch', () => {
  const mockCommandMenuItems: CommandMenuItemConfig[] = [
    {
      key: 'command-menu-item-1',
      label: 'Create Record',
      type: CommandMenuItemType.Standard,
      scope: CommandMenuItemScope.Global,
      position: 1,
      Icon: IconPlus,
      component: MockComponent,
      hotKeys: ['c', 'r'],
    },
    {
      key: 'command-menu-item-2',
      label: 'Delete Record',
      type: CommandMenuItemType.Standard,
      scope: CommandMenuItemScope.RecordSelection,
      position: 2,
      Icon: IconPlus,
      component: MockComponent,
      hotKeys: ['d', 'e', 'l'],
    },
    {
      key: 'command-menu-item-3',
      label: 'Update Record',
      type: CommandMenuItemType.Standard,
      scope: CommandMenuItemScope.Object,
      position: 3,
      Icon: IconPlus,
      component: MockComponent,
    },
  ];

  it('should return all command menu items when search is empty', () => {
    const { result } = renderHook(() =>
      useFilterCommandMenuItemsWithSidePanelSearch({ sidePanelSearch: '' }),
    );

    const filtered =
      result.current.filterCommandMenuItemsWithSidePanelSearch(
        mockCommandMenuItems,
      );

    expect(filtered).toEqual(mockCommandMenuItems);
  });

  it('should filter command menu items by label', () => {
    const { result } = renderHook(() =>
      useFilterCommandMenuItemsWithSidePanelSearch({
        sidePanelSearch: 'Create',
      }),
    );

    const filtered =
      result.current.filterCommandMenuItemsWithSidePanelSearch(
        mockCommandMenuItems,
      );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('command-menu-item-1');
  });

  it('should filter command menu items by hotkeys', () => {
    const { result } = renderHook(() =>
      useFilterCommandMenuItemsWithSidePanelSearch({
        sidePanelSearch: 'del',
      }),
    );

    const filtered =
      result.current.filterCommandMenuItemsWithSidePanelSearch(
        mockCommandMenuItems,
      );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('command-menu-item-2');
  });

  it('should return empty array when no command menu items match', () => {
    const { result } = renderHook(() =>
      useFilterCommandMenuItemsWithSidePanelSearch({
        sidePanelSearch: 'xyz',
      }),
    );

    const filtered =
      result.current.filterCommandMenuItemsWithSidePanelSearch(
        mockCommandMenuItems,
      );

    expect(filtered).toEqual([]);
  });

  it('should match command menu items by either label or hotkeys', () => {
    const { result } = renderHook(() =>
      useFilterCommandMenuItemsWithSidePanelSearch({
        sidePanelSearch: 'Record',
      }),
    );

    const filtered =
      result.current.filterCommandMenuItemsWithSidePanelSearch(
        mockCommandMenuItems,
      );

    expect(filtered).toHaveLength(3);
  });
});
