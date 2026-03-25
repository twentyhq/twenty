import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { SIDE_PANEL_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/side-panel/constants/SidePanelContextChipGroupsDropdownId';
import { SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelPreviousComponentInstanceId';
import { useSidePanelCloseAnimationCompleteCleanup } from '@/side-panel/hooks/useSidePanelCloseAnimationCompleteCleanup';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconList } from 'twenty-ui/display';

const mockCloseDropdown = jest.fn();
const mockResetContextStoreStates = jest.fn();
const mockResetSelectedItem = jest.fn();
const mockEmitSidePanelCloseEvent = jest.fn();

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({
    closeDropdown: mockCloseDropdown,
  }),
}));

jest.mock('@/command-menu/hooks/useResetContextStoreStates', () => ({
  useResetContextStoreStates: () => ({
    resetContextStoreStates: mockResetContextStoreStates,
  }),
}));

jest.mock('@/ui/layout/selectable-list/hooks/useSelectableList', () => ({
  useSelectableList: () => ({
    resetSelectedItem: mockResetSelectedItem,
  }),
}));

jest.mock('@/ui/layout/side-panel/utils/emitSidePanelCloseEvent', () => ({
  emitSidePanelCloseEvent: () => {
    mockEmitSidePanelCloseEvent();
  },
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MemoryRouter>{children}</MemoryRouter>
  </JotaiProvider>
);

describe('useSidePanelCloseAnimationCompleteCleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHooks = () => {
    const { result } = renderHook(
      () => {
        const { sidePanelCloseAnimationCompleteCleanup } =
          useSidePanelCloseAnimationCompleteCleanup();

        const viewableRecordId = useAtomStateValue(viewableRecordIdState);

        const setViewableRecordId = useSetAtomState(viewableRecordIdState);

        return {
          sidePanelCloseAnimationCompleteCleanup,
          viewableRecordId,
          setViewableRecordId,
        };
      },
      {
        wrapper: Wrapper,
      },
    );
    return { result };
  };

  it('should reset modified states back to default values', () => {
    const { result } = renderHooks();

    act(() => {
      jotaiStore.set(sidePanelPageState.atom, SidePanelPages.ViewRecord);
      jotaiStore.set(sidePanelPageInfoState.atom, {
        title: 'Test Record',
        Icon: IconList,
        instanceId: 'test-id',
      });
      jotaiStore.set(isSidePanelOpenedState.atom, true);
      jotaiStore.set(sidePanelSearchState.atom, 'test search');
      jotaiStore.set(sidePanelNavigationStackState.atom, [
        {
          page: SidePanelPages.SearchRecords,
          pageTitle: 'Search',
          pageIcon: IconList,
          pageId: '1',
        },
      ]);
      jotaiStore.set(hasUserSelectedSidePanelListItemState.atom, true);
      jotaiStore.set(isSidePanelClosingState.atom, true);
      result.current.setViewableRecordId('record-123');
    });

    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.ViewRecord,
    );
    expect(jotaiStore.get(sidePanelPageInfoState.atom)).toEqual({
      title: 'Test Record',
      Icon: IconList,
      instanceId: 'test-id',
    });
    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);
    expect(jotaiStore.get(sidePanelSearchState.atom)).toBe('test search');
    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SidePanelPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconList,
        pageId: '1',
      },
    ]);
    expect(jotaiStore.get(hasUserSelectedSidePanelListItemState.atom)).toBe(
      true,
    );
    expect(jotaiStore.get(isSidePanelClosingState.atom)).toBe(true);
    expect(result.current.viewableRecordId).toBe('record-123');

    act(() => {
      result.current.sidePanelCloseAnimationCompleteCleanup();
    });

    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(SidePanelPages.Root);
    expect(jotaiStore.get(sidePanelPageInfoState.atom)).toEqual({
      title: undefined,
      Icon: undefined,
      instanceId: '',
    });
    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);
    expect(jotaiStore.get(sidePanelSearchState.atom)).toBe('');
    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([]);
    expect(jotaiStore.get(hasUserSelectedSidePanelListItemState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(isSidePanelClosingState.atom)).toBe(false);
    expect(result.current.viewableRecordId).toBe(null);
  });

  it('should call all dependent functions correctly', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.sidePanelCloseAnimationCompleteCleanup();
    });

    expect(mockCloseDropdown).toHaveBeenCalledTimes(1);
    expect(mockResetContextStoreStates).toHaveBeenCalledTimes(2);
    expect(mockResetSelectedItem).toHaveBeenCalledTimes(1);
    expect(mockEmitSidePanelCloseEvent).toHaveBeenCalledTimes(1);

    expect(mockCloseDropdown).toHaveBeenCalledWith(
      SIDE_PANEL_CONTEXT_CHIP_GROUPS_DROPDOWN_ID,
    );
    expect(mockResetContextStoreStates).toHaveBeenNthCalledWith(
      1,
      SIDE_PANEL_COMPONENT_INSTANCE_ID,
    );
    expect(mockResetContextStoreStates).toHaveBeenNthCalledWith(
      2,
      SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID,
    );
  });
});
