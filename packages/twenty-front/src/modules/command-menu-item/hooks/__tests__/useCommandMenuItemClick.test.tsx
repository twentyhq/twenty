import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { IconApps } from 'twenty-ui/icon';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import {
  type ContextStoreTargetedRecordsRule,
  contextStoreTargetedRecordsRuleComponentState,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';

const companyObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
  (item) => item.nameSingular === 'company',
)!;

// jest.mock factories run before this file's own constants exist.
jest.mock('@/object-metadata/states/objectMetadataItemsSelector', () => ({
  objectMetadataItemsSelector: {
    atom: jest.requireActual('jotai').atom(
      jest
        .requireActual('~/testing/utils/getTestEnrichedObjectMetadataItemsMock')
        .getTestEnrichedObjectMetadataItemsMock()
        .filter(
          (item: { nameSingular: string }) => item.nameSingular === 'company',
        ),
    ),
  },
}));

const mockOpenFrontComponentInSidePanel = jest.fn();
const mockMountCommand = jest.fn();

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: () => 'context-store-instance-id',
  }),
);

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

const getWrapper = ({
  commandMenuContextApi,
  targetedRecordsRule,
}: {
  commandMenuContextApi: CommandMenuContextApi;
  targetedRecordsRule: ContextStoreTargetedRecordsRule;
}) => {
  const store = createStore();
  store.set(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: 'context-store-instance-id',
    }),
    companyObjectMetadataItem.id,
  );
  store.set(
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: 'context-store-instance-id',
    }),
    targetedRecordsRule,
  );

  return ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
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
    </JotaiProvider>
  );
};

describe('useCommandMenuItemClick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      description: 'the object and the record when one record is selected',
      objectMetadataItem: { nameSingular: 'company' },
      selectedRecordIds: ['record-1'],
      storedRecordIds: ['record-1'],
      expectedRecordContext: {
        objectNameSingular: 'company',
        selectedRecordIds: ['record-1'],
        selectedRecordsFilter: { id: { in: ['record-1'] } },
      },
    },
    {
      description: 'the object when several records are selected',
      objectMetadataItem: { nameSingular: 'company' },
      selectedRecordIds: ['record-1', 'record-2'],
      storedRecordIds: ['record-1', 'record-2'],
      expectedRecordContext: {
        objectNameSingular: 'company',
        selectedRecordIds: ['record-1', 'record-2'],
        selectedRecordsFilter: { id: { in: ['record-1', 'record-2'] } },
      },
    },
    {
      description: 'selected records missing from the record store',
      objectMetadataItem: { nameSingular: 'company' },
      selectedRecordIds: ['record-1', 'record-2'],
      storedRecordIds: ['record-1'],
      expectedRecordContext: {
        objectNameSingular: 'company',
        selectedRecordIds: ['record-1', 'record-2'],
        selectedRecordsFilter: { id: { in: ['record-1', 'record-2'] } },
      },
    },
    {
      description: 'the object when no record is selected',
      objectMetadataItem: { nameSingular: 'company' },
      selectedRecordIds: [],
      storedRecordIds: [],
      expectedRecordContext: {
        objectNameSingular: 'company',
        selectedRecordIds: [],
        selectedRecordsFilter: { id: { in: [] } },
      },
    },
    {
      description: 'no record context outside an object',
      objectMetadataItem: {},
      selectedRecordIds: ['record-1'],
      storedRecordIds: ['record-1'],
      expectedRecordContext: undefined,
    },
  ])(
    'opens a side panel front component with $description',
    async ({
      objectMetadataItem,
      selectedRecordIds,
      storedRecordIds,
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
            commandMenuContextApi: {
              ...EMPTY_COMMAND_MENU_CONTEXT_API,
              objectMetadataItem,
              selectedRecords: storedRecordIds.map((id) => ({
                id,
                __typename: 'Company',
              })),
            },
            targetedRecordsRule: { mode: 'selection', selectedRecordIds },
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

  it('opens a side panel front component with the filter of a Select all', async () => {
    const { result } = renderHook(
      () =>
        useCommandMenuItemClick({
          item: FRONT_COMPONENT_COMMAND_MENU_ITEM,
          Icon: IconApps,
          label: 'Open front component',
        }),
      {
        wrapper: getWrapper({
          commandMenuContextApi: {
            ...EMPTY_COMMAND_MENU_CONTEXT_API,
            objectMetadataItem: { nameSingular: 'company' },
            selectedRecords: [],
          },
          targetedRecordsRule: {
            mode: 'exclusion',
            excludedRecordIds: ['record-3'],
          },
        }),
      },
    );

    await act(async () => {
      await result.current.handleClick();
    });

    expect(mockOpenFrontComponentInSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        recordContext: {
          objectNameSingular: 'company',
          selectedRecordIds: [],
          selectedRecordsFilter: {
            and: expect.arrayContaining([
              { not: { id: { in: ['record-3'] } } },
            ]),
          },
        },
      }),
    );
  });
});
