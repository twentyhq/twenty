import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useRecoilValue } from 'recoil';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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

      const commandMenuPage = useRecoilValue(commandMenuPageState);
      const commandMenuNavigationMorphItemsByPage = useRecoilValue(
        commandMenuNavigationMorphItemsByPageState,
      );

      const viewableRecordId = useRecoilComponentValue(
        viewableRecordIdComponentState,
        'mocked-uuid',
      );
      const viewableRecordNameSingular = useRecoilComponentValue(
        viewableRecordNameSingularComponentState,
        'mocked-uuid',
      );
      const currentObjectMetadataItemId = useRecoilComponentValue(
        contextStoreCurrentObjectMetadataItemIdComponentState,
        'mocked-uuid',
      );
      const targetedRecordsRule = useRecoilComponentValue(
        contextStoreTargetedRecordsRuleComponentState,
        'mocked-uuid',
      );
      const numberOfSelectedRecords = useRecoilComponentValue(
        contextStoreNumberOfSelectedRecordsComponentState,
        'mocked-uuid',
      );
      const currentViewType = useRecoilComponentValue(
        contextStoreCurrentViewTypeComponentState,
        'mocked-uuid',
      );
      const { getIcon } = useIcons();

      return {
        openRecordInCommandMenu,
        viewableRecordId,
        commandMenuPage,
        commandMenuNavigationMorphItemsByPage,
        viewableRecordNameSingular,
        currentObjectMetadataItemId,
        targetedRecordsRule,
        numberOfSelectedRecords,
        currentViewType,
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
    expect(result.current.currentObjectMetadataItemId).toBe(
      personMockObjectMetadataItem.id,
    );
    expect(result.current.targetedRecordsRule).toEqual({
      mode: 'selection',
      selectedRecordIds: [recordId],
    });
    expect(result.current.numberOfSelectedRecords).toBe(1);
    expect(result.current.currentViewType).toBe(ContextStoreViewType.ShowPage);

    expect(result.current.commandMenuNavigationMorphItemsByPage.size).toBe(1);
    expect(
      result.current.commandMenuNavigationMorphItemsByPage.get('mocked-uuid'),
    ).toEqual([
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
