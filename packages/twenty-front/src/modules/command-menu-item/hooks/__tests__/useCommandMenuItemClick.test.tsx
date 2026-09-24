import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { ContextStorePageType } from 'twenty-shared/types';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

const mockMountCommand = jest.fn();
const mockCloseDropdown = jest.fn();
const mockCloseSidePanelMenu = jest.fn();

jest.mock('@/command-menu-item/engine-command/hooks/useMountCommand', () => ({
  useMountCommand: () => mockMountCommand,
}));

jest.mock('@/side-panel/hooks/useOpenFrontComponentInSidePanel', () => ({
  useOpenFrontComponentInSidePanel: () => ({
    openFrontComponentInSidePanel: jest.fn(),
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: mockCloseDropdown }),
}));

const EXPORT_COMMAND_MENU_ITEM: CommandMenuItemDefinition = {
  id: 'export-command',
  engineComponentKey: EngineComponentKey.EXPORT_RECORDS,
  label: 'Export',
  position: 0,
  isPinned: false,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  isActive: true,
};

const getWrapper = ({
  pageType,
  isInSidePanel,
}: {
  pageType: ContextStorePageType;
  isInSidePanel: boolean;
}) => {
  const store = createStore();

  return ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: 'context-store' }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: 'command-menu' }}
        >
          <CommandMenuContext.Provider
            value={{
              containerType:
                pageType === ContextStorePageType.Record
                  ? CommandMenuItemContainerType.CommandMenuShowPageDropdown
                  : CommandMenuItemContainerType.IndexPageDropdown,
              displayType: 'dropdownItem',
              commandMenuItems: [EXPORT_COMMAND_MENU_ITEM],
              commandMenuContextApi: {
                ...EMPTY_COMMAND_MENU_CONTEXT_API,
                pageType,
                isInSidePanel,
                selectedRecords: [{ id: 'selected-record' }],
                numberOfSelectedRecords: 1,
              },
              isInPreviewMode: false,
            }}
          >
            {children}
          </CommandMenuContext.Provider>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};

describe('useCommandMenuItemClick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each([false, true])('isInSidePanel: %s', (isInSidePanel) => {
    it.each([
      {
        description: 'closes the menu for a single-record export',
        pageType: ContextStorePageType.Record,
        engineComponentKey: EngineComponentKey.EXPORT_RECORDS,
        shouldClose: true,
      },
      {
        description: 'keeps the menu open for selected index records',
        pageType: ContextStorePageType.Index,
        engineComponentKey: EngineComponentKey.EXPORT_RECORDS,
        shouldClose: false,
      },
      {
        description: 'keeps the menu open for a view export',
        pageType: ContextStorePageType.Index,
        engineComponentKey: EngineComponentKey.EXPORT_VIEW,
        shouldClose: false,
      },
    ])(
      '$description',
      async ({ pageType, engineComponentKey, shouldClose }) => {
        const { result } = renderHook(
          () =>
            useCommandMenuItemClick({
              item: { ...EXPORT_COMMAND_MENU_ITEM, engineComponentKey },
              Icon: () => null,
              label: 'Export',
            }),
          { wrapper: getWrapper({ pageType, isInSidePanel }) },
        );

        await act(async () => {
          await result.current.handleClick();
        });

        if (shouldClose) {
          expect(mockCloseDropdown).toHaveBeenCalledWith(
            isInSidePanel
              ? 'side-panel-command-menu-dropdown-command-menu'
              : 'command-menu-dropdown-command-menu',
          );
        } else {
          expect(mockCloseDropdown).not.toHaveBeenCalled();
        }

        expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
        expect(mockMountCommand).toHaveBeenCalledTimes(1);
        expect(mockMountCommand).toHaveBeenCalledWith(
          expect.objectContaining({
            engineCommandId: EXPORT_COMMAND_MENU_ITEM.id,
            engineComponentKey,
            isInSidePanel,
          }),
        );
      },
    );
  });
});
