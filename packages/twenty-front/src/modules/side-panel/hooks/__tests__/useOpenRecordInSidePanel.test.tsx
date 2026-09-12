import { renderHook } from '@testing-library/react';
import { i18n } from '@lingui/core';
import { act } from 'react';

import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { newRecordTitleCellToOpenState } from '@/object-record/record-title-cell/states/newRecordTitleCellToOpenState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AppPath, SidePanelPages } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconDotsVertical } from 'twenty-ui/icon';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

i18n.activate('en');

const mockNavigateSidePanel = jest.fn();
jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
    navigateSidePanel: mockNavigateSidePanel,
  }),
}));

jest.mock('@/app/routing/utils/isWorkspaceLocationAvailableOnSurface', () => ({
  isWorkspaceLocationAvailableOnSurface: () => true,
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

      return {
        openRecordInSidePanel,
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
    jotaiStore.set(sidePanelNavigationStackState.atom, []);
    jotaiStore.set(sidePanelNavigationMorphItemsByPageState.atom, new Map());
  });

  it('should host the record page and navigate to it', () => {
    const { result } = renderHooks();

    const recordId = 'record-123';
    const objectNameSingular = 'person';

    act(() => {
      result.current.openRecordInSidePanel({
        recordId,
        objectNameSingular,
      });
    });

    const recordPath = getAppPath(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: recordId,
    });

    const sidePanelNavigationMorphItemsByPage = jotaiStore.get(
      sidePanelNavigationMorphItemsByPageState.atom,
    );
    expect(sidePanelNavigationMorphItemsByPage.size).toBe(0);

    expect(mockNavigateSidePanel).toHaveBeenCalledWith({
      page: SidePanelPages.RoutedPage,
      pageTitle: recordPath,
      pageIcon: IconDotsVertical,
      pageId: 'mocked-uuid',
      routedFlowStateScopeId: 'mocked-uuid',
      routedLocation: expect.objectContaining({
        pathname: recordPath,
        state: null,
      }),
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
      page: SidePanelPages.RoutedPage,
      pageTitle: 'New Person',
      pageIcon: IconDotsVertical,
      pageId: 'mocked-uuid',
      routedFlowStateScopeId: 'mocked-uuid',
      routedLocation: expect.objectContaining({
        pathname: getAppPath(AppPath.RecordShowPage, {
          objectNameSingular,
          objectRecordId: recordId,
        }),
        state: null,
      }),
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

  it('puts the requested tab in the canonical routed record URL', () => {
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

    expect(mockNavigateSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        routedLocation: expect.objectContaining({
          pathname: getAppPath(AppPath.RecordShowPage, {
            objectNameSingular,
            objectRecordId: recordId,
          }),
          hash: '#tab-emails',
        }),
      }),
    );
  });

  it('updates the tab on the existing panel page without pushing the same record again', () => {
    const { result } = renderHooks();

    const recordId = 'already-open-record';
    const objectNameSingular = 'person';
    const existingPageId = 'existing-side-panel-page';
    const recordPath = getAppPath(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: recordId,
    });

    jotaiStore.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.RoutedPage,
        pageTitle: 'Person',
        pageIcon: IconDotsVertical,
        pageId: existingPageId,
        routedLocation: {
          pathname: recordPath,
          search: '',
          hash: '',
          state: null,
          key: 'existing-location',
        },
      },
    ]);

    let openedPageId: string | null = null;

    act(() => {
      openedPageId = result.current.openRecordInSidePanel({
        recordId,
        objectNameSingular,
        tab: 'tab-emails',
      });
    });

    expect(openedPageId).toBe(existingPageId);
    expect(mockNavigateSidePanel).not.toHaveBeenCalled();
    expect(jotaiStore.get(sidePanelNavigationStackState.atom).at(-1)).toEqual(
      expect.objectContaining({
        pageId: existingPageId,
        routedLocation: expect.objectContaining({
          pathname: recordPath,
          hash: '#tab-emails',
        }),
      }),
    );
  });

  it('pushes a route when the record ID matches but the object does not', () => {
    const { result } = renderHooks();
    const recordId = 'shared-record-id';

    jotaiStore.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.RoutedPage,
        pageTitle: 'Company',
        pageIcon: IconDotsVertical,
        pageId: 'existing-company-page',
        routedLocation: {
          pathname: getAppPath(AppPath.RecordShowPage, {
            objectNameSingular: 'company',
            objectRecordId: recordId,
          }),
          search: '',
          hash: '',
          state: null,
          key: 'existing-company-location',
        },
      },
    ]);

    act(() => {
      result.current.openRecordInSidePanel({
        recordId,
        objectNameSingular: 'person',
      });
    });

    expect(mockNavigateSidePanel).toHaveBeenCalledTimes(1);
    expect(mockNavigateSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        routedLocation: expect.objectContaining({
          pathname: getAppPath(AppPath.RecordShowPage, {
            objectNameSingular: 'person',
            objectRecordId: recordId,
          }),
        }),
      }),
    );
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

  it('should navigate to the record page instead of the side panel on mobile', () => {
    mockIsMobile = true;
    const { result } = renderHooks();

    act(() => {
      result.current.openRecordInSidePanel({
        recordId: 'record-123',
        objectNameSingular: 'person',
      });
    });

    expect(mockNavigateApp).toHaveBeenCalledWith(
      AppPath.RecordShowPage,
      {
        objectNameSingular: 'person',
        objectRecordId: 'record-123',
      },
      undefined,
      { surface: 'main' },
    );
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

    expect(mockNavigateApp).toHaveBeenCalledWith(
      AppPath.RecordShowPage,
      {
        objectNameSingular: 'person',
        objectRecordId: 'new-record-123',
      },
      undefined,
      { surface: 'main' },
    );
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
