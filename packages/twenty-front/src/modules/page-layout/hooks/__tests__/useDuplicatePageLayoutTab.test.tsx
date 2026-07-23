import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useDuplicatePageLayoutTab } from '@/page-layout/hooks/useDuplicatePageLayoutTab';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: jest.fn(),
  }),
}));

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: jest.fn(),
    }),
  }),
);

const SOURCE_TAB_ID = 'source-tab-id';
const SOURCE_WIDGET_ID = 'source-widget-id';
const SOURCE_VIEW_ID = 'source-view-id';

const makeRecordTableWidget = (): PageLayoutWidget =>
  ({
    __typename: 'PageLayoutWidget',
    id: SOURCE_WIDGET_ID,
    applicationId: 'application-id',
    pageLayoutTabId: SOURCE_TAB_ID,
    title: 'Companies',
    type: WidgetType.RECORD_TABLE,
    objectMetadataId: 'object-metadata-id',
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
    position: {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 4,
      columnSpan: 4,
    },
    configuration: {
      __typename: 'RecordTableConfiguration',
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      viewId: SOURCE_VIEW_ID,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    isActive: true,
  }) as PageLayoutWidget;

const makeSourceTab = (widgets: PageLayoutWidget[]): PageLayoutTab =>
  ({
    __typename: 'PageLayoutTab',
    id: SOURCE_TAB_ID,
    applicationId: 'application-id',
    title: 'Companies',
    icon: null,
    position: 0,
    layoutMode: PageLayoutTabLayoutMode.GRID,
    pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    widgets,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    isActive: true,
  }) as PageLayoutTab;

const makeDraftPageLayout = (tabs: PageLayoutTab[]): DraftPageLayout => ({
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  name: 'Test Layout',
  type: PageLayoutType.DASHBOARD,
  objectMetadataId: null,
  tabs,
});

const sourceRecordTableViewSnapshot: RecordTableWidgetViewSnapshot = {
  view: {
    id: SOURCE_VIEW_ID,
    name: 'Companies Table',
    icon: 'IconTable',
    objectMetadataId: 'object-metadata-id',
    type: ViewType.TABLE_WIDGET,
    isCompact: false,
    position: 0,
    openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
    visibility: ViewVisibility.WORKSPACE,
    shouldHideEmptyGroups: false,
    isActive: true,
  },
  viewFields: [
    {
      id: 'source-view-field-id',
      viewId: SOURCE_VIEW_ID,
      fieldMetadataId: 'field-metadata-id',
      position: 0,
      size: 180,
      isVisible: true,
      isActive: true,
    },
  ],
  viewFilterGroups: [],
  viewFilters: [],
  viewSorts: [],
  viewGroups: [],
};

describe('useDuplicatePageLayoutTab', () => {
  const getWrapper =
    (store = createStore()) =>
    ({ children }: { children: ReactNode }) => (
      <PageLayoutTestWrapper
        store={store}
        instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}
      >
        {children}
      </PageLayoutTestWrapper>
    );

  const getPageLayoutDraftAtom = () =>
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  const getPageLayoutCurrentLayoutsAtom = () =>
    pageLayoutCurrentLayoutsComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  const getRecordTableWidgetViewDraftAtom = () =>
    recordTableWidgetViewDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clone record-table widget views when duplicating a tab', () => {
    const uuidModule = require('uuid');
    uuidModule.v4
      .mockReturnValueOnce('new-tab-id')
      .mockReturnValueOnce('new-widget-id')
      .mockReturnValueOnce('new-view-id')
      .mockReturnValueOnce('new-view-field-id');

    const store = createStore();
    const recordTableWidget = makeRecordTableWidget();

    store.set(
      getPageLayoutDraftAtom(),
      makeDraftPageLayout([makeSourceTab([recordTableWidget])]),
    );
    store.set(getPageLayoutCurrentLayoutsAtom(), {
      [SOURCE_TAB_ID]: {
        desktop: [{ i: SOURCE_WIDGET_ID, x: 0, y: 0, w: 4, h: 4 }],
        mobile: [{ i: SOURCE_WIDGET_ID, x: 0, y: 0, w: 1, h: 4 }],
      },
    });
    store.set(getRecordTableWidgetViewDraftAtom(), {
      [SOURCE_WIDGET_ID]: sourceRecordTableViewSnapshot,
    });

    const { result } = renderHook(
      () =>
        useDuplicatePageLayoutTab({
          pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          tabListInstanceId: getTabListInstanceIdFromPageLayoutId(
            PAGE_LAYOUT_TEST_INSTANCE_ID,
          ),
        }),
      { wrapper: getWrapper(store) },
    );

    act(() => {
      result.current.duplicateTab(SOURCE_TAB_ID);
    });

    const pageLayoutDraft = store.get(getPageLayoutDraftAtom());
    const duplicatedTab = pageLayoutDraft.tabs.find(
      (tab) => tab.id === 'new-tab-id',
    );
    const duplicatedWidget = duplicatedTab?.widgets[0];
    const recordTableWidgetViewDraft = store.get(
      getRecordTableWidgetViewDraftAtom(),
    );

    expect(duplicatedWidget?.id).toBe('new-widget-id');
    expect(duplicatedWidget?.configuration).toMatchObject({
      viewId: 'new-view-id',
    });
    expect(recordTableWidgetViewDraft['new-widget-id'].view.id).toBe(
      'new-view-id',
    );
    expect(recordTableWidgetViewDraft['new-widget-id'].viewFields[0]).toEqual(
      expect.objectContaining({
        id: 'new-view-field-id',
        viewId: 'new-view-id',
      }),
    );
  });

  it('should clone record-table widget views from metadata when source draft is not initialized', () => {
    const uuidModule = require('uuid');
    uuidModule.v4
      .mockReturnValueOnce('new-tab-id')
      .mockReturnValueOnce('new-widget-id')
      .mockReturnValueOnce('new-view-id')
      .mockReturnValueOnce('new-view-field-id');

    const store = createStore();
    const recordTableWidget = makeRecordTableWidget();

    store.set(
      getPageLayoutDraftAtom(),
      makeDraftPageLayout([makeSourceTab([recordTableWidget])]),
    );
    store.set(getPageLayoutCurrentLayoutsAtom(), {
      [SOURCE_TAB_ID]: {
        desktop: [{ i: SOURCE_WIDGET_ID, x: 0, y: 0, w: 4, h: 4 }],
        mobile: [{ i: SOURCE_WIDGET_ID, x: 0, y: 0, w: 1, h: 4 }],
      },
    });
    store.set(metadataStoreState.atomFamily('views'), {
      current: [sourceRecordTableViewSnapshot.view],
      draft: [],
      status: 'up-to-date',
    });
    store.set(metadataStoreState.atomFamily('viewFields'), {
      current: sourceRecordTableViewSnapshot.viewFields,
      draft: [],
      status: 'up-to-date',
    });

    const { result } = renderHook(
      () =>
        useDuplicatePageLayoutTab({
          pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          tabListInstanceId: getTabListInstanceIdFromPageLayoutId(
            PAGE_LAYOUT_TEST_INSTANCE_ID,
          ),
        }),
      { wrapper: getWrapper(store) },
    );

    act(() => {
      result.current.duplicateTab(SOURCE_TAB_ID);
    });

    const pageLayoutDraft = store.get(getPageLayoutDraftAtom());
    const duplicatedTab = pageLayoutDraft.tabs.find(
      (tab) => tab.id === 'new-tab-id',
    );
    const duplicatedWidget = duplicatedTab?.widgets[0];
    const recordTableWidgetViewDraft = store.get(
      getRecordTableWidgetViewDraftAtom(),
    );

    expect(duplicatedWidget?.configuration).toMatchObject({
      viewId: 'new-view-id',
    });
    expect(recordTableWidgetViewDraft['new-widget-id'].view.id).toBe(
      'new-view-id',
    );
    expect(recordTableWidgetViewDraft['new-widget-id'].viewFields[0]).toEqual(
      expect.objectContaining({
        id: 'new-view-field-id',
        viewId: 'new-view-id',
      }),
    );
  });
});
