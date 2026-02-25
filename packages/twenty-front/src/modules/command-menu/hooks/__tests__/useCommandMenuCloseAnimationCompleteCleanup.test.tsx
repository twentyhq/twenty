import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuContextChipGroupsDropdownId';
import { COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuPreviousComponentInstanceId';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CommandMenuPages } from 'twenty-shared/types';
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

jest.mock('@/ui/layout/right-drawer/utils/emitSidePanelCloseEvent', () => ({
  emitSidePanelCloseEvent: () => {
    mockEmitSidePanelCloseEvent();
  },
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <RecoilRoot>
      <MemoryRouter>{children}</MemoryRouter>
    </RecoilRoot>
  </JotaiProvider>
);

describe('useCommandMenuCloseAnimationCompleteCleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHooks = () => {
    const { result } = renderHook(
      () => {
        const { commandMenuCloseAnimationCompleteCleanup } =
          useCommandMenuCloseAnimationCompleteCleanup();

        const viewableRecordId = useAtomStateValue(viewableRecordIdState);

        const setViewableRecordId = useSetAtomState(viewableRecordIdState);

        return {
          commandMenuCloseAnimationCompleteCleanup,
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
      jotaiStore.set(commandMenuPageState.atom, CommandMenuPages.ViewRecord);
      jotaiStore.set(commandMenuPageInfoState.atom, {
        title: 'Test Record',
        Icon: IconList,
        instanceId: 'test-id',
      });
      jotaiStore.set(isCommandMenuOpenedStateV2.atom, true);
      jotaiStore.set(commandMenuSearchState.atom, 'test search');
      jotaiStore.set(commandMenuNavigationStackState.atom, [
        {
          page: CommandMenuPages.SearchRecords,
          pageTitle: 'Search',
          pageIcon: IconList,
          pageId: '1',
        },
      ]);
      jotaiStore.set(hasUserSelectedCommandState.atom, true);
      jotaiStore.set(isCommandMenuClosingState.atom, true);
      result.current.setViewableRecordId('record-123');
    });

    expect(jotaiStore.get(commandMenuPageState.atom)).toBe(
      CommandMenuPages.ViewRecord,
    );
    expect(jotaiStore.get(commandMenuPageInfoState.atom)).toEqual({
      title: 'Test Record',
      Icon: IconList,
      instanceId: 'test-id',
    });
    expect(jotaiStore.get(isCommandMenuOpenedStateV2.atom)).toBe(true);
    expect(jotaiStore.get(commandMenuSearchState.atom)).toBe('test search');
    expect(jotaiStore.get(commandMenuNavigationStackState.atom)).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconList,
        pageId: '1',
      },
    ]);
    expect(jotaiStore.get(hasUserSelectedCommandState.atom)).toBe(true);
    expect(jotaiStore.get(isCommandMenuClosingState.atom)).toBe(true);
    expect(result.current.viewableRecordId).toBe('record-123');

    act(() => {
      result.current.commandMenuCloseAnimationCompleteCleanup();
    });

    expect(jotaiStore.get(commandMenuPageState.atom)).toBe(
      CommandMenuPages.Root,
    );
    expect(jotaiStore.get(commandMenuPageInfoState.atom)).toEqual({
      title: undefined,
      Icon: undefined,
      instanceId: '',
    });
    expect(jotaiStore.get(isCommandMenuOpenedStateV2.atom)).toBe(false);
    expect(jotaiStore.get(commandMenuSearchState.atom)).toBe('');
    expect(jotaiStore.get(commandMenuNavigationStackState.atom)).toEqual([]);
    expect(jotaiStore.get(hasUserSelectedCommandState.atom)).toBe(false);
    expect(jotaiStore.get(isCommandMenuClosingState.atom)).toBe(false);
    expect(result.current.viewableRecordId).toBe(null);
  });

  it('should call all dependent functions correctly', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenuCloseAnimationCompleteCleanup();
    });

    expect(mockCloseDropdown).toHaveBeenCalledTimes(1);
    expect(mockResetContextStoreStates).toHaveBeenCalledTimes(2);
    expect(mockResetSelectedItem).toHaveBeenCalledTimes(1);
    expect(mockEmitSidePanelCloseEvent).toHaveBeenCalledTimes(1);

    expect(mockCloseDropdown).toHaveBeenCalledWith(
      COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID,
    );
    expect(mockResetContextStoreStates).toHaveBeenNthCalledWith(
      1,
      COMMAND_MENU_COMPONENT_INSTANCE_ID,
    );
    expect(mockResetContextStoreStates).toHaveBeenNthCalledWith(
      2,
      COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID,
    );
  });
});
