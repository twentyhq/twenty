import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { type CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ContextStorePageType } from 'twenty-shared/types';

const TEST_COMMAND_MENU_ID = 'test-cmd-menu-1';

const mockCloseSidePanelMenu = jest.fn();
const mockCloseDropdown = jest.fn();

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: () => TEST_COMMAND_MENU_ID,
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({
    closeDropdown: mockCloseDropdown,
  }),
}));

const getWrapper =
  ({
    containerType,
    isInSidePanel = false,
  }: {
    containerType: CommandMenuItemContainerType;
    isInSidePanel?: boolean;
  }) =>
  ({ children }: { children: ReactNode }) => (
    <CommandMenuContext.Provider
      value={{
        containerType,
        displayType: 'button',
        commandMenuItems: [],
        commandMenuContextApi: {
          pageType: ContextStorePageType.Index,
          isInSidePanel,
          isDashboardPageLayoutInEditMode: false,
          isLayoutCustomizationModeEnabled: false,
          favoriteRecordIds: [],
          isSelectAll: false,
          hasAnySoftDeleteFilterOnView: false,
          numberOfSelectedRecords: 0,
          objectPermissions: {
            canReadObjectRecords: false,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
            restrictedFields: {},
            objectMetadataId: '',
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
          selectedRecords: [],
          featureFlags: {},
          targetObjectReadPermissions: {},
          targetObjectWritePermissions: {},
          objectMetadataItem: {},
          objectMetadataLabel: '',
        },
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCloseCommandMenu', () => {
  describe('when containerType is command-menu-list', () => {
    it('should call closeSidePanelMenu by default', () => {
      const wrapper = getWrapper({ containerType: 'command-menu-list' });

      const { result } = renderHook(() => useCloseCommandMenu(), { wrapper });

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
      expect(mockCloseDropdown).not.toHaveBeenCalled();
    });

    it('should not call closeSidePanelMenu when closeSidePanelOnCommandMenuListExecution is false', () => {
      const wrapper = getWrapper({ containerType: 'command-menu-list' });

      const { result } = renderHook(
        () =>
          useCloseCommandMenu({
            closeSidePanelOnCommandMenuListExecution: false,
          }),
        { wrapper },
      );

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
      expect(mockCloseDropdown).not.toHaveBeenCalled();
    });

    it('should not call closeDropdown', () => {
      const wrapper = getWrapper({ containerType: 'command-menu-list' });

      const { result } = renderHook(() => useCloseCommandMenu(), { wrapper });

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseDropdown).not.toHaveBeenCalled();
    });
  });

  describe('when containerType is index-page-dropdown', () => {
    it('should call closeDropdown with the correct dropdown id', () => {
      const wrapper = getWrapper({ containerType: 'index-page-dropdown' });

      const { result } = renderHook(() => useCloseCommandMenu(), { wrapper });

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseDropdown).toHaveBeenCalledWith(
        `command-menu-dropdown-${TEST_COMMAND_MENU_ID}`,
      );
    });

    it('should not call closeSidePanelMenu', () => {
      const wrapper = getWrapper({ containerType: 'index-page-dropdown' });

      const { result } = renderHook(() => useCloseCommandMenu(), { wrapper });

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
    });
  });

  describe('when containerType is command-menu-show-page-dropdown', () => {
    it('should call closeDropdown with the correct dropdown id', () => {
      const wrapper = getWrapper({
        containerType: 'command-menu-show-page-dropdown',
      });

      const { result } = renderHook(() => useCloseCommandMenu(), { wrapper });

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseDropdown).toHaveBeenCalledWith(
        `command-menu-dropdown-${TEST_COMMAND_MENU_ID}`,
      );
    });

    it('should not call closeSidePanelMenu by default', () => {
      const wrapper = getWrapper({
        containerType: 'command-menu-show-page-dropdown',
      });

      const { result } = renderHook(() => useCloseCommandMenu(), { wrapper });

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
    });

    it('should call closeSidePanelMenu when closeSidePanelOnShowPageOptionsExecution is true', () => {
      const wrapper = getWrapper({
        containerType: 'command-menu-show-page-dropdown',
      });

      const { result } = renderHook(
        () =>
          useCloseCommandMenu({
            closeSidePanelOnShowPageOptionsExecution: true,
          }),
        { wrapper },
      );

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('when isInSidePanel is true', () => {
    it('should use side panel dropdown id for closeDropdown', () => {
      const wrapper = getWrapper({
        containerType: 'index-page-dropdown',
        isInSidePanel: true,
      });

      const { result } = renderHook(() => useCloseCommandMenu(), { wrapper });

      act(() => {
        result.current.closeCommandMenu();
      });

      expect(mockCloseDropdown).toHaveBeenCalledWith(
        `side-panel-command-menu-dropdown-${TEST_COMMAND_MENU_ID}`,
      );
    });
  });
});
