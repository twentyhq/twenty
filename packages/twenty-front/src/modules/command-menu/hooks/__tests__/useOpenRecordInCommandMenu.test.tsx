import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useRecoilValue } from 'recoil';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useIcons } from 'twenty-ui';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateCommandMenu = jest.fn();
jest.mock('@/command-menu/hooks/useCommandMenu', () => ({
  useCommandMenu: () => ({
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
  contextStoreNumberOfSelectedRecords: 2,
  contextStoreCurrentViewType: ContextStoreViewType.Table,
});

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

      const viewableRecordId = useRecoilValue(viewableRecordIdState);
      const commandMenuPage = useRecoilValue(commandMenuPageState);
      const commandMenuNavigationMorphItemByPage = useRecoilValue(
        commandMenuNavigationMorphItemByPageState,
      );

      const viewableRecordIdComponent = useRecoilValue(
        viewableRecordIdComponentState.atomFamily({
          instanceId: 'mocked-uuid',
        }),
      );
      const viewableRecordNameSingularComponent = useRecoilValue(
        viewableRecordNameSingularComponentState.atomFamily({
          instanceId: 'mocked-uuid',
        }),
      );
      const currentObjectMetadataItemIdComponent = useRecoilValue(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: 'mocked-uuid',
        }),
      );
      const targetedRecordsRuleComponent = useRecoilValue(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: 'mocked-uuid',
        }),
      );
      const numberOfSelectedRecordsComponent = useRecoilValue(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: 'mocked-uuid',
        }),
      );
      const currentViewTypeComponent = useRecoilValue(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: 'mocked-uuid',
        }),
      );
      const { getIcon } = useIcons();

      return {
        openRecordInCommandMenu,
        viewableRecordId,
        commandMenuPage,
        commandMenuNavigationMorphItemByPage,
        viewableRecordIdComponent,
        viewableRecordNameSingularComponent,
        currentObjectMetadataItemIdComponent,
        targetedRecordsRuleComponent,
        numberOfSelectedRecordsComponent,
        currentViewTypeComponent,
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
    expect(result.current.viewableRecordIdComponent).toBe(recordId);
    expect(result.current.viewableRecordNameSingularComponent).toBe(
      objectNameSingular,
    );
    expect(result.current.currentObjectMetadataItemIdComponent).toBe(
      personMockObjectMetadataItem.id,
    );
    expect(result.current.targetedRecordsRuleComponent).toEqual({
      mode: 'selection',
      selectedRecordIds: [recordId],
    });
    expect(result.current.numberOfSelectedRecordsComponent).toBe(1);
    expect(result.current.currentViewTypeComponent).toBe(
      ContextStoreViewType.ShowPage,
    );

    expect(result.current.commandMenuNavigationMorphItemByPage.size).toBe(1);
    expect(
      result.current.commandMenuNavigationMorphItemByPage.get('mocked-uuid'),
    ).toEqual({
      objectMetadataId: personMockObjectMetadataItem.id,
      recordId,
    });

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

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        pageTitle: 'New Person',
      }),
    );
  });
});
