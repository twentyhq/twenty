import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { renderHook } from '@testing-library/react';
import { IconPlus } from 'twenty-ui/display';
import { useFilterActionsWithCommandMenuSearch } from '@/command-menu/hooks/useFilterActionsWithCommandMenuSearch';

const MockComponent = <div>Mock Component</div>;

describe('useFilterActionsWithCommandMenuSearch', () => {
  const mockActions: ActionConfig[] = [
    {
      key: 'action-1',
      label: 'Create Record',
      type: ActionType.Standard,
      scope: ActionScope.Global,
      position: 1,
      Icon: IconPlus,
      shouldBeRegistered: () => true,
      component: MockComponent,
      hotKeys: ['c', 'r'],
    },
    {
      key: 'action-2',
      label: 'Delete Record',
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      position: 2,
      Icon: IconPlus,
      shouldBeRegistered: () => true,
      component: MockComponent,
      hotKeys: ['d', 'e', 'l'],
    },
    {
      key: 'action-3',
      label: 'Update Record',
      type: ActionType.Standard,
      scope: ActionScope.Object,
      position: 3,
      Icon: IconPlus,
      shouldBeRegistered: () => true,
      component: MockComponent,
    },
  ];

  it('should return all actions when search is empty', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithCommandMenuSearch({ commandMenuSearch: '' }),
    );

    const filtered =
      result.current.filterActionsWithCommandMenuSearch(mockActions);

    expect(filtered).toEqual(mockActions);
  });

  it('should filter actions by label', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithCommandMenuSearch({ commandMenuSearch: 'Create' }),
    );

    const filtered =
      result.current.filterActionsWithCommandMenuSearch(mockActions);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('action-1');
  });

  it('should filter actions by hotkeys', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithCommandMenuSearch({ commandMenuSearch: 'del' }),
    );

    const filtered =
      result.current.filterActionsWithCommandMenuSearch(mockActions);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].key).toBe('action-2');
  });

  it('should return empty array when no actions match', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithCommandMenuSearch({ commandMenuSearch: 'xyz' }),
    );

    const filtered =
      result.current.filterActionsWithCommandMenuSearch(mockActions);

    expect(filtered).toEqual([]);
  });

  it('should match actions by either label or hotkeys', () => {
    const { result } = renderHook(() =>
      useFilterActionsWithCommandMenuSearch({ commandMenuSearch: 'Record' }),
    );

    const filtered =
      result.current.filterActionsWithCommandMenuSearch(mockActions);

    expect(filtered).toHaveLength(3);
  });
});
