import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { IconApps } from 'twenty-ui/icon';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';

const mockOpenFrontComponentInSidePanel = jest.fn();
const mockMountCommand = jest.fn();

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: () => 'context-store-instance-id',
  }),
);

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => false,
}));

jest.mock('@/command-menu-item/engine-command/hooks/useMountCommand', () => ({
  useMountCommand: () => mockMountCommand,
}));

jest.mock('@/command-menu-item/hooks/useCloseCommandMenu', () => ({
  useCloseCommandMenu: () => ({ closeCommandMenu: jest.fn() }),
}));

jest.mock('@/side-panel/hooks/useOpenFrontComponentInSidePanel', () => ({
  useOpenFrontComponentInSidePanel: () => ({
    openFrontComponentInSidePanel: mockOpenFrontComponentInSidePanel,
  }),
}));

jest.mock(
  '@/command-menu-item/engine-command/constants/EngineComponentKeyHeadlessComponentMap',
  () => ({ ENGINE_COMPONENT_KEY_COMPONENT_MAP: {} }),
);

jest.mock(
  '@/command-menu-item/engine-command/record/components/ExportRecordsCommand',
  () => ({ ExportRecordsCommand: () => null }),
);

const FRONT_COMPONENT_COMMAND_MENU_ITEM = {
  id: 'command-menu-item-id',
  frontComponentId: 'front-component-id',
  frontComponent: {
    id: 'front-component-id',
    name: 'front-component',
    isHeadless: false,
  },
} as CommandMenuItemDefinition;

const getWrapper =
  (commandMenuContextApi: CommandMenuContextApi) =>
  ({ children }: { children: ReactNode }) => (
    <CommandMenuContext.Provider
      value={{
        containerType: CommandMenuItemContainerType.CommandMenuList,
        displayType: 'listItem',
        commandMenuItems: [],
        commandMenuContextApi,
        isInPreviewMode: false,
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );

describe('useCommandMenuItemClick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      description: 'the object and the record when one record is selected',
      objectMetadataItem: { nameSingular: 'company' },
      selectedRecordIds: ['record-1'],
      expectedRecordContext: {
        objectNameSingular: 'company',
        recordId: 'record-1',
      },
    },
    {
      description: 'the object when several records are selected',
      objectMetadataItem: { nameSingular: 'company' },
      selectedRecordIds: ['record-1', 'record-2'],
      expectedRecordContext: {
        objectNameSingular: 'company',
        recordId: undefined,
      },
    },
    {
      description: 'the object when no record is selected',
      objectMetadataItem: { nameSingular: 'company' },
      selectedRecordIds: [],
      expectedRecordContext: {
        objectNameSingular: 'company',
        recordId: undefined,
      },
    },
    {
      description: 'no record context outside an object',
      objectMetadataItem: {},
      selectedRecordIds: ['record-1'],
      expectedRecordContext: undefined,
    },
  ])(
    'opens a side panel front component with $description',
    async ({
      objectMetadataItem,
      selectedRecordIds,
      expectedRecordContext,
    }) => {
      const { result } = renderHook(
        () =>
          useCommandMenuItemClick({
            item: FRONT_COMPONENT_COMMAND_MENU_ITEM,
            Icon: IconApps,
            label: 'Open front component',
          }),
        {
          wrapper: getWrapper({
            ...EMPTY_COMMAND_MENU_CONTEXT_API,
            objectMetadataItem,
            selectedRecords: selectedRecordIds.map((id) => ({
              id,
              __typename: 'Company',
            })),
          }),
        },
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockMountCommand).not.toHaveBeenCalled();
      expect(mockOpenFrontComponentInSidePanel).toHaveBeenCalledWith({
        frontComponentId: 'front-component-id',
        pageTitle: 'Open front component',
        pageIcon: IconApps,
        recordContext: expectedRecordContext,
      });
    },
  );
});
