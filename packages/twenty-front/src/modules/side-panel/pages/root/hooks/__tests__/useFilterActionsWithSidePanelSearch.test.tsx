import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { renderHook } from '@testing-library/react';
import { IconPlus } from 'twenty-ui/display';
import { useFilterActionsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterActionsWithSidePanelSearch';

const MockComponent = <div>Mock Component</div>;

describe('useFilterActionsWithSidePanelSearch', () => {
  const mockActions: CommandMenuItemConfig[] = [
    {
      key: 'action-1',
      label: 'Create Record',
      type: CommandMenuItemType.Standard,
      scope: CommandMenuItemScope.Global,
      position: 1,
      Icon: IconPlus,
      shouldBeRegistered: () => true,
      component: MockComponent,
      hotKeys: ['c', 'r'],
    },
    {
      key: 'action-2',
      label: 'Delete Record',
      type: CommandMenuItemType.Standard,
      scope: CommandMenuItemScope.RecordSelection,
      position: 2,
      Icon: IconPlus,
      shouldBeRegistered: () => true,
      component: MockComponent,
      hotKeys: ['d', 'e', 'l'],
    },
    {
      key: 'action-3',
      label: 'Update Record',
      type: CommandMenuItemType.Standard,
      scope: CommandMenuItemScope.Object,
      position: 3,
      Icon: IconPlus,
      shouldBeRegistered: () => true,
      component: MockComponent,
    },
  ];

  it('should return all actions when search is empty', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithSidePanelSearch({ sidePanelSearch: '' }),
    );

    const filtered =
      result.current.filterActionsWithSidePanelSearch(mockActions);

    expect(filtered).toEqual(mockActions);
  });

  it('should filter actions by label', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithSidePanelSearch({ sidePanelSearch: 'Create' }),
    );

    const filtered =
      result.current.filterActionsWithSidePanelSearch(mockActions);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('action-1');
  });

  it('should filter actions by hotkeys', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithSidePanelSearch({ sidePanelSearch: 'del' }),
    );

    const filtered =
      result.current.filterActionsWithSidePanelSearch(mockActions);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('action-2');
  });

  it('should return empty array when no actions match', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithSidePanelSearch({ sidePanelSearch: 'xyz' }),
    );

    const filtered =
      result.current.filterActionsWithSidePanelSearch(mockActions);

    expect(filtered).toEqual([]);
  });

  it('should match actions by either label or hotkeys', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithSidePanelSearch({ sidePanelSearch: 'Record' }),
    );

    const filtered =
      result.current.filterActionsWithSidePanelSearch(mockActions);

    expect(filtered).toHaveLength(3);
  });
});
