import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { CommandMenuPages } from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateCommandMenu = jest.fn();
jest.mock('@/command-menu/hooks/useNavigateCommandMenu', () => ({
  useNavigateCommandMenu: () => ({
    navigateCommandMenu: mockNavigateCommandMenu,
  }),
}));

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular:
    personMockObjectMetadataItem.nameSingular,
  contextStoreCurrentViewId: 'my-view-id',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords: 0,
  contextStoreCurrentViewType: ContextStoreViewType.Table,
});

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

      const viewableRecordId = useAtomComponentStateValue(
        viewableRecordIdComponentState,
        'mocked-uuid',
      );
      const viewableRecordNameSingular = useAtomComponentStateValue(
        viewableRecordNameSingularComponentState,
        'mocked-uuid',
      );
      const contextStoreCurrentObjectMetadataItemId =
        useAtomComponentStateValue(
          contextStoreCurrentObjectMetadataItemIdComponentState,
          'mocked-uuid',
        );
      const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
        contextStoreTargetedRecordsRuleComponentState,
        'mocked-uuid',
      );
      const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
        contextStoreNumberOfSelectedRecordsComponentState,
        'mocked-uuid',
      );
      const contextStoreCurrentViewType = useAtomComponentStateValue(
        contextStoreCurrentViewTypeComponentState,
        'mocked-uuid',
      );
      const { getIcon } = useIcons();

      return {
        openRecordInCommandMenu,
        viewableRecordId,
        viewableRecordNameSingular,
        contextStoreCurrentObjectMetadataItemId,
        contextStoreTargetedRecordsRule,
        contextStoreNumberOfSelectedRecords,
        contextStoreCurrentViewType,
        getIcon,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useOpenRecordInCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set the correct states and navigate to the record page', () => {
    const { result } = renderHooks();

    const recordId = 'record-123';
    const objectNameSingular = 'person';

    act(() => {
      result.current.openRecordInCommandMenu({
        recordId,
        objectNameSingular,
      });
    });

    expect(result.current.viewableRecordId).toBe(recordId);
    expect(result.current.viewableRecordNameSingular).toBe(objectNameSingular);
    expect(result.current.contextStoreCurrentObjectMetadataItemId).toBe(
      personMockObjectMetadataItem.id,
    );
    expect(result.current.contextStoreTargetedRecordsRule).toEqual({
      mode: 'selection',
      selectedRecordIds: [recordId],
    });
    expect(result.current.contextStoreNumberOfSelectedRecords).toBe(1);
    expect(result.current.contextStoreCurrentViewType).toBe(
      ContextStoreViewType.ShowPage,
    );

    const commandMenuNavigationMorphItemsByPage = jotaiStore.get(
      commandMenuNavigationMorphItemsByPageState.atom,
    );
    expect(commandMenuNavigationMorphItemsByPage.size).toBe(1);
    expect(commandMenuNavigationMorphItemsByPage.get('mocked-uuid')).toEqual([
      {
        objectMetadataId: personMockObjectMetadataItem.id,
        recordId,
      },
    ]);

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.ViewRecord,
      pageTitle: 'Person',
      pageIcon: result.current.getIcon(personMockObjectMetadataItem.icon),
      pageIconColor: 'currentColor',
      pageId: 'mocked-uuid',
      resetNavigationStack: false,
    });
  });

  it('should set the correct page title for a new record', () => {
    const { result } = renderHooks();

    const recordId = 'new-record-123';
    const objectNameSingular = 'person';

    act(() => {
      result.current.openRecordInCommandMenu({
        recordId,
        objectNameSingular,
        isNewRecord: true,
      });
    });

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.ViewRecord,
      pageTitle: 'New Person',
      pageIcon: result.current.getIcon(personMockObjectMetadataItem.icon),
      pageIconColor: 'currentColor',
      pageId: 'mocked-uuid',
      resetNavigationStack: false,
    });
  });
});
