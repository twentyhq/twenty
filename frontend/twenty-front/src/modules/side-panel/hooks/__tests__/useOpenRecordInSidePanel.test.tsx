import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { SidePanelPages } from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateSidePanel = jest.fn();
jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
    navigateSidePanel: mockNavigateSidePanel,
  }),
}));

const mockOpenNewRecordTitleCell = jest.fn();
jest.mock(
  '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell',
  () => ({
    useOpenNewRecordTitleCell: () => ({
      openNewRecordTitleCell: mockOpenNewRecordTitleCell,
    }),
  }),
);

const personMockObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'person',
  )!;

const wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
  apolloMocks: [],
  componentInstanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
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
      const { openRecordInSidePanel } = useOpenRecordInSidePanel();

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
        openRecordInSidePanel,
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

describe('useOpenRecordInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set the correct states and navigate to the record page', () => {
    const { result } = renderHooks();

    const recordId = 'record-123';
    const objectNameSingular = 'person';

    act(() => {
      result.current.openRecordInSidePanel({
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

    const sidePanelNavigationMorphItemsByPage = jotaiStore.get(
      sidePanelNavigationMorphItemsByPageState.atom,
    );
    expect(sidePanelNavigationMorphItemsByPage.size).toBe(1);
    expect(sidePanelNavigationMorphItemsByPage.get('mocked-uuid')).toEqual([
      {
        objectMetadataId: personMockObjectMetadataItem.id,
        recordId,
      },
    ]);

    expect(mockNavigateSidePanel).toHaveBeenCalledWith({
      page: SidePanelPages.ViewRecord,
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
      result.current.openRecordInSidePanel({
        recordId,
        objectNameSingular,
        isNewRecord: true,
      });
    });

    expect(mockNavigateSidePanel).toHaveBeenCalledWith({
      page: SidePanelPages.ViewRecord,
      pageTitle: 'New Person',
      pageIcon: result.current.getIcon(personMockObjectMetadataItem.icon),
      pageIconColor: 'currentColor',
      pageId: 'mocked-uuid',
      resetNavigationStack: false,
    });
  });

  it('should open title cell in edit mode when isNewRecord is true', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openRecordInSidePanel({
        recordId: 'new-record-123',
        objectNameSingular: 'person',
        isNewRecord: true,
      });
    });

    expect(mockOpenNewRecordTitleCell).toHaveBeenCalledWith({
      recordId: 'new-record-123',
      fieldName: getLabelIdentifierFieldMetadataItem(
        personMockObjectMetadataItem,
      )?.name,
    });
  });

  it('should not open title cell when isNewRecord is false', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openRecordInSidePanel({
        recordId: 'record-123',
        objectNameSingular: 'person',
      });
    });

    expect(mockOpenNewRecordTitleCell).not.toHaveBeenCalled();
  });
});
