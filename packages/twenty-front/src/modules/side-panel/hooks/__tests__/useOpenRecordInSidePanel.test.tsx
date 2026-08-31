import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { newRecordTitleCellToOpenState } from '@/object-record/record-title-cell/states/newRecordTitleCellToOpenState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { SIDE_PANEL_ARTIFACT_PAGE } from '@/side-panel/constants/SidePanelArtifactPage';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AppPath, ContextStorePageType } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
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

const mockNavigateApp = jest.fn();
jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigateApp,
}));

let mockIsMobile = false;
jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockIsMobile,
}));

const personMockObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'person',
  )!;

const personRecordPageLayout = {
  id: 'person-record-page-layout-id',
  name: 'Person record page',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: personMockObjectMetadataItem.id,
  universalIdentifier: 'person-record-page-layout-universal-identifier',
  isSystemSideEffect: true,
  defaultTabToFocusOnMobileAndSidePanelId: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
};

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
      const contextStoreCurrentPageType = useAtomComponentStateValue(
        contextStoreCurrentPageTypeComponentState,
        'mocked-uuid',
      );
      const { getIcon } = useIcons();

      return {
        openRecordInSidePanel,
        contextStoreCurrentObjectMetadataItemId,
        contextStoreTargetedRecordsRule,
        contextStoreNumberOfSelectedRecords,
        contextStoreCurrentPageType,
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
    mockIsMobile = false;
    jotaiStore.set(newRecordTitleCellToOpenState.atom, null);
    jotaiStore.set(metadataStoreState.atomFamily('pageLayouts'), {
      current: [personRecordPageLayout],
      draft: [],
      status: 'up-to-date',
    });
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

    expect(result.current.contextStoreCurrentObjectMetadataItemId).toBe(
      personMockObjectMetadataItem.id,
    );
    expect(result.current.contextStoreTargetedRecordsRule).toEqual({
      mode: 'selection',
      selectedRecordIds: [recordId],
    });
    expect(result.current.contextStoreNumberOfSelectedRecords).toBe(1);
    expect(result.current.contextStoreCurrentPageType).toBe(
      ContextStorePageType.Record,
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
      page: SIDE_PANEL_ARTIFACT_PAGE,
      artifactPath: getAppPath(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      }),
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
      page: SIDE_PANEL_ARTIFACT_PAGE,
      artifactPath: getAppPath(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      }),
      pageTitle: 'New Person',
      pageIcon: result.current.getIcon(personMockObjectMetadataItem.icon),
      pageIconColor: 'currentColor',
      pageId: 'mocked-uuid',
      resetNavigationStack: false,
    });
  });

  it('preserves an explicit canonical artifact path', () => {
    const { result } = renderHooks();
    const artifactPath = `${getAppPath(AppPath.RecordShowPage, {
      objectNameSingular: 'person',
      objectRecordId: 'record-123',
    })}?tab=timeline#activity`;

    act(() => {
      result.current.openRecordInSidePanel({
        recordId: 'record-123',
        objectNameSingular: 'person',
        artifactPath,
      });
    });

    expect(mockNavigateSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({ artifactPath }),
    );
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

  it('should preset the record page active tab when a tab is provided', () => {
    const { result } = renderHooks();

    const recordId = 'record-123';
    const objectNameSingular = 'person';

    act(() => {
      result.current.openRecordInSidePanel({
        recordId,
        objectNameSingular,
        tab: 'tab-emails',
      });
    });

    const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: personRecordPageLayout.id,
      layoutType: PageLayoutType.RECORD_PAGE,
      targetRecordIdentifier: {
        id: recordId,
        targetObjectNameSingular: objectNameSingular,
      },
    });

    expect(
      jotaiStore.get(
        activeTabIdComponentState.atomFamily({
          instanceId: tabListInstanceId,
        }),
      ),
    ).toBe('tab-emails');
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

  it('does not repeat new-record effects when the record is already current', () => {
    const { result } = renderHooks();
    const artifactPath = getAppPath(AppPath.RecordShowPage, {
      objectNameSingular: 'person',
      objectRecordId: 'new-record-123',
    });

    act(() => {
      result.current.openRecordInSidePanel({
        recordId: 'new-record-123',
        objectNameSingular: 'person',
        isNewRecord: true,
      });
    });

    // This suite mocks the low-level navigator, so mirror the stack write it
    // normally performs before exercising the idempotent adapter path.
    jotaiStore.set(sidePanelNavigationStackState.atom, [
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath,
        pageTitle: 'New Person',
        pageIcon: result.current.getIcon(personMockObjectMetadataItem.icon),
        pageIconColor: 'currentColor',
        pageId: 'mocked-uuid',
      },
    ]);

    act(() => {
      result.current.openRecordInSidePanel({
        recordId: 'new-record-123',
        objectNameSingular: 'person',
        isNewRecord: true,
      });
    });

    expect(mockNavigateSidePanel).toHaveBeenCalledTimes(1);
    expect(mockOpenNewRecordTitleCell).toHaveBeenCalledTimes(1);
  });

  it('should navigate to the record page instead of the side panel on mobile', () => {
    mockIsMobile = true;
    const { result } = renderHooks();

    act(() => {
      result.current.openRecordInSidePanel({
        recordId: 'record-123',
        objectNameSingular: 'person',
      });
    });

    expect(mockNavigateApp).toHaveBeenCalledWith(AppPath.RecordShowPage, {
      objectNameSingular: 'person',
      objectRecordId: 'record-123',
    });
    expect(mockNavigateSidePanel).not.toHaveBeenCalled();
    expect(jotaiStore.get(newRecordTitleCellToOpenState.atom)).toBeNull();
  });

  it('should forward new record state to the record page on mobile', () => {
    mockIsMobile = true;
    const { result } = renderHooks();

    act(() => {
      result.current.openRecordInSidePanel({
        recordId: 'new-record-123',
        objectNameSingular: 'person',
        isNewRecord: true,
      });
    });

    expect(mockNavigateApp).toHaveBeenCalledWith(AppPath.RecordShowPage, {
      objectNameSingular: 'person',
      objectRecordId: 'new-record-123',
    });
    expect(jotaiStore.get(newRecordTitleCellToOpenState.atom)).toEqual({
      recordId: 'new-record-123',
      fieldName: getLabelIdentifierFieldMetadataItem(
        personMockObjectMetadataItem,
      )?.name,
    });
    expect(mockOpenNewRecordTitleCell).not.toHaveBeenCalled();
  });

  it('should preset the record page active tab on mobile', () => {
    mockIsMobile = true;
    const { result } = renderHooks();

    const recordId = 'record-123';
    const objectNameSingular = 'person';

    act(() => {
      result.current.openRecordInSidePanel({
        recordId,
        objectNameSingular,
        tab: 'tab-emails',
      });
    });

    const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: personRecordPageLayout.id,
      layoutType: PageLayoutType.RECORD_PAGE,
      targetRecordIdentifier: {
        id: recordId,
        targetObjectNameSingular: objectNameSingular,
      },
    });

    expect(
      jotaiStore.get(
        activeTabIdComponentState.atomFamily({
          instanceId: tabListInstanceId,
        }),
      ),
    ).toBe('tab-emails');
  });
});
