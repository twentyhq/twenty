import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuContextChipGroupsDropdownId';
import { COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuPreviousComponentInstanceId';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
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
  <RecoilRoot>
    <MemoryRouter>{children}</MemoryRouter>
  </RecoilRoot>
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

        const commandMenuPage = useRecoilValue(commandMenuPageState);
        const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);
        const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
        const commandMenuSearch = useRecoilValue(commandMenuSearchState);
        const commandMenuNavigationStack = useRecoilValue(
          commandMenuNavigationStackState,
        );

        const commandMenuNavigationMorphItemsByPage = useRecoilValue(
          commandMenuNavigationMorphItemsByPageState,
        );
        const hasUserSelectedCommand = useRecoilValue(
          hasUserSelectedCommandState,
        );
        const isCommandMenuClosing = useRecoilValue(isCommandMenuClosingState);
        const viewableRecordId = useRecoilValue(viewableRecordIdState);

        // Get setters for state modification in tests
        const setCommandMenuPage = useSetRecoilState(commandMenuPageState);
        const setCommandMenuPageInfo = useSetRecoilState(
          commandMenuPageInfoState,
        );
        const setIsCommandMenuOpened = useSetRecoilState(
          isCommandMenuOpenedState,
        );
        const setCommandMenuSearch = useSetRecoilState(commandMenuSearchState);
        const setCommandMenuNavigationStack = useSetRecoilState(
          commandMenuNavigationStackState,
        );

        const setHasUserSelectedCommand = useSetRecoilState(
          hasUserSelectedCommandState,
        );
        const setIsCommandMenuClosing = useSetRecoilState(
          isCommandMenuClosingState,
        );
        const setViewableRecordId = useSetRecoilState(viewableRecordIdState);

        return {
          commandMenuCloseAnimationCompleteCleanup,
          commandMenuPage,
          commandMenuPageInfo,
          isCommandMenuOpened,
          commandMenuSearch,
          commandMenuNavigationStack,
          commandMenuNavigationMorphItemsByPage,
          hasUserSelectedCommand,
          isCommandMenuClosing,
          viewableRecordId,
          setCommandMenuPage,
          setCommandMenuPageInfo,
          setIsCommandMenuOpened,
          setCommandMenuSearch,
          setCommandMenuNavigationStack,
          setHasUserSelectedCommand,
          setIsCommandMenuClosing,
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
      result.current.setCommandMenuPage(CommandMenuPages.ViewRecord);
      result.current.setCommandMenuPageInfo({
        title: 'Test Record',
        Icon: IconList,
        instanceId: 'test-id',
      });
      result.current.setIsCommandMenuOpened(true);
      result.current.setCommandMenuSearch('test search');
      result.current.setCommandMenuNavigationStack([
        {
          page: CommandMenuPages.SearchRecords,
          pageTitle: 'Search',
          pageIcon: IconList,
          pageId: '1',
        },
      ]);
      result.current.setHasUserSelectedCommand(true);
      result.current.setIsCommandMenuClosing(true);
      result.current.setViewableRecordId('record-123');
    });

    expect(result.current.commandMenuPage).toBe(CommandMenuPages.ViewRecord);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Test Record',
      Icon: IconList,
      instanceId: 'test-id',
    });
    expect(result.current.isCommandMenuOpened).toBe(true);
    expect(result.current.commandMenuSearch).toBe('test search');
    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconList,
        pageId: '1',
      },
    ]);
    expect(result.current.hasUserSelectedCommand).toBe(true);
    expect(result.current.isCommandMenuClosing).toBe(true);
    expect(result.current.viewableRecordId).toBe('record-123');

    act(() => {
      result.current.commandMenuCloseAnimationCompleteCleanup();
    });

    expect(result.current.commandMenuPage).toBe(CommandMenuPages.Root);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: undefined,
      Icon: undefined,
      instanceId: '',
    });
    expect(result.current.isCommandMenuOpened).toBe(false);
    expect(result.current.commandMenuSearch).toBe('');
    expect(result.current.commandMenuNavigationStack).toEqual([]);
    expect(result.current.hasUserSelectedCommand).toBe(false);
    expect(result.current.isCommandMenuClosing).toBe(false);
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
