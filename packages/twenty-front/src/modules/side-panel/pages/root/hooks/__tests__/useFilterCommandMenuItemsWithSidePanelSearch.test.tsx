import { renderHook } from '@testing-library/react';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';
import { type CommandMenuContextApi } from 'twenty-shared/types';

const MOCK_CONTEXT_API = {
  objectMetadataItem: { id: '', nameSingular: '', namePlural: '' },
  numberOfSelectedRecords: 0,
  selectedRecords: [],
  isInSidePanel: false,
  pageType: 'INDEX_PAGE',
} as unknown as CommandMenuContextApi;

const buildMockItem = (
  overrides: Partial<CommandMenuItemFieldsFragment>,
): CommandMenuItemFieldsFragment => ({
  __typename: 'CommandMenuItem',
  id: 'default-id',
  workflowVersionId: null,
  frontComponentId: null,
  frontComponent: null,
  engineComponentKey: EngineComponentKey.ADD_TO_FAVORITES,
  label: 'Default',
  icon: null,
  shortLabel: null,
  position: 0,
  isPinned: false,
  hotKeys: null,
  conditionalAvailabilityExpression: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  availabilityObjectMetadataId: null,
  payload: null,
  ...overrides,
});

describe('useFilterCommandMenuItemsWithSidePanelSearch', () => {
  const mockCommandMenuItems: CommandMenuItemFieldsFragment[] = [
    buildMockItem({
      id: 'command-menu-item-1',
      label: 'Create Record',
      hotKeys: ['c', 'r'],
    }),
    buildMockItem({
      id: 'command-menu-item-2',
      label: 'Delete Record',
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      position: 2,
      hotKeys: ['d', 'e', 'l'],
    }),
    buildMockItem({
      id: 'command-menu-item-3',
      label: 'Update Record',
      position: 3,
    }),
  ];

  it('should return all command menu items when search is empty', () => {
    const { result } = renderHook(() =>
      useFilterCommandMenuItemsWithSidePanelSearch({
        sidePanelSearch: '',
        commandMenuContextApi: MOCK_CONTEXT_API,
      }),
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
        commandMenuContextApi: MOCK_CONTEXT_API,
      }),
    );

    const filtered =
      result.current.filterCommandMenuItemsWithSidePanelSearch(
        mockCommandMenuItems,
      );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('command-menu-item-1');
  });

  it('should filter command menu items by hotkeys', () => {
    const { result } = renderHook(() =>
      useFilterCommandMenuItemsWithSidePanelSearch({
        sidePanelSearch: 'del',
        commandMenuContextApi: MOCK_CONTEXT_API,
      }),
    );

    const filtered =
      result.current.filterCommandMenuItemsWithSidePanelSearch(
        mockCommandMenuItems,
      );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('command-menu-item-2');
  });

  it('should return empty array when no command menu items match', () => {
    const { result } = renderHook(() =>
      useFilterCommandMenuItemsWithSidePanelSearch({
        sidePanelSearch: 'xyz',
        commandMenuContextApi: MOCK_CONTEXT_API,
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
        commandMenuContextApi: MOCK_CONTEXT_API,
      }),
    );

    const filtered =
      result.current.filterCommandMenuItemsWithSidePanelSearch(
        mockCommandMenuItems,
      );

    expect(filtered).toHaveLength(3);
  });
});
