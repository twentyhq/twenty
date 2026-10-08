import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { IconApps } from 'twenty-ui/icon';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import {
  EngineComponentKey,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';

const mockOpenFrontComponentInSidePanel = jest.fn();
const mockMountCommand = jest.fn();
const mockUseIsFeatureEnabled = jest.fn();

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: () => 'context-store-instance-id',
  }),
);

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: (featureFlagKey: FeatureFlagKey) =>
    mockUseIsFeatureEnabled(featureFlagKey),
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
  (commandMenuContextApi: CommandMenuContextApi, store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
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

describe('useCommandMenuItemClick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsFeatureEnabled.mockReturnValue(false);
  });

  it.each([
    {
      description: 'record creation while the form is open',
      engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
      isRecordCreationFormEnabled: true,
      expectedLoader: false,
    },
    {
      description: 'record creation without the form',
      engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
      isRecordCreationFormEnabled: false,
      expectedLoader: true,
    },
    {
      description: 'an export with creation forms enabled',
      engineComponentKey: EngineComponentKey.EXPORT_RECORDS,
      isRecordCreationFormEnabled: true,
      expectedLoader: true,
    },
  ])(
    'keeps $description disabled with the appropriate loader until completion',
    async ({
      engineComponentKey,
      isRecordCreationFormEnabled,
      expectedLoader,
    }) => {
      const store = createStore();
      const item = {
        id: 'engine-command',
        engineComponentKey,
      } as CommandMenuItemDefinition;

      mockUseIsFeatureEnabled.mockImplementation(
        (featureFlagKey: FeatureFlagKey) =>
          featureFlagKey === FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED
            ? isRecordCreationFormEnabled
            : true,
      );

      store.set(
        headlessCommandContextApisState.atom,
        new Map([
          [
            item.id,
            {
              engineComponentKey,
              contextStoreInstanceId: 'context-store-instance-id',
              objectMetadataItem: null,
              currentViewId: null,
              recordIndexId: null,
              targetedRecordsRule: {
                mode: 'selection',
                selectedRecordIds: [],
              },
              selectedRecords: [],
              graphqlFilter: null,
              payload: null,
              navigationTargetObjectMetadataId: null,
            },
          ],
        ]),
      );

      const { result } = renderHook(
        () =>
          useCommandMenuItemClick({ item, Icon: IconApps, label: 'Create' }),
        { wrapper: getWrapper(EMPTY_COMMAND_MENU_CONTEXT_API, store) },
      );

      expect(result.current.disabled).toBe(true);
      expect(result.current.showDisabledLoader).toBe(expectedLoader);

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockMountCommand).not.toHaveBeenCalled();

      act(() => {
        store.set(headlessCommandContextApisState.atom, new Map());
      });

      expect(result.current.disabled).toBe(false);
      expect(result.current.showDisabledLoader).toBe(false);
    },
  );

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
