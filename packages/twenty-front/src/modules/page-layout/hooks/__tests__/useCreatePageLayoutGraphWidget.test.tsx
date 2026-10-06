import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import {
  BarChartLayout,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      {
        id: 'company-object',
        fields: [
          {
            id: 'company-created-at',
            name: 'createdAt',
            label: 'Created at',
            type: 'DATE_TIME',
            isActive: true,
          },
        ],
      },
      {
        id: 'person-object',
        fields: [
          {
            id: 'person-created-at',
            name: 'createdAt',
            label: 'Created at',
            type: 'DATE_TIME',
            isActive: true,
          },
        ],
      },
    ],
  }),
}));

const TAB_LIST_INSTANCE_ID = getTabListInstanceIdFromPageLayoutId(
  PAGE_LAYOUT_TEST_INSTANCE_ID,
);

const makeBarChartWidget = (id: string, layout: BarChartLayout) =>
  buildDraftPageLayoutWidget({
    id,
    pageLayoutTabId: 'tab-1',
    title: id,
    type: WidgetType.GRAPH,
    configuration: { ...buildDefaultBarChartConfiguration({}), layout },
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 2,
      columnSpan: 2,
    },
  });

describe('useCreatePageLayoutGraphWidget', () => {
  const getDraftAtom = () =>
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  const getCurrentLayoutsAtom = () =>
    pageLayoutCurrentLayoutsComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  const createStoreWithWidgets = (
    widgets: PageLayoutWidget[],
    dashboardFilters: DashboardFilterSlot[] | null = null,
  ) => {
    const store = createStore();

    store.set(getDraftAtom(), {
      ...makeDraft([
        makeTab('tab-1', widgets, 0, PageLayoutTabLayoutMode.GRID),
      ]),
      type: PageLayoutType.DASHBOARD,
      dashboardFilters,
    });
    store.set(
      activeTabIdComponentState.atomFamily({
        instanceId: TAB_LIST_INSTANCE_ID,
      }),
      'tab-1',
    );

    return store;
  };

  const renderCreateGraphHook = (store: ReturnType<typeof createStore>) =>
    renderHook(
      () =>
        useCreatePageLayoutGraphWidget({
          pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          tabListInstanceId: TAB_LIST_INSTANCE_ID,
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

  it('should create a vertical bar chart from the field selection with the bar chart size', () => {
    const store = createStoreWithWidgets([]);
    const { result } = renderCreateGraphHook(store);

    act(() => {
      result.current.createPageLayoutGraphWidget({
        fieldSelection: {
          objectMetadataId: 'object-1',
          groupByFieldMetadataIdX: 'field-2',
          aggregateFieldMetadataId: 'field-1',
        },
      });
    });

    const widgets = store.get(getDraftAtom()).tabs[0].widgets;

    expect(widgets).toHaveLength(1);
    expect(widgets[0]).toMatchObject({
      id: 'mock-uuid',
      pageLayoutTabId: 'tab-1',
      type: WidgetType.GRAPH,
      title: 'Vertical Bar Chart 1',
      objectMetadataId: 'object-1',
      configuration: {
        __typename: 'BarChartConfiguration',
        layout: BarChartLayout.VERTICAL,
        primaryAxisGroupByFieldMetadataId: 'field-2',
        aggregateFieldMetadataId: 'field-1',
      },
    });
    expect(store.get(getCurrentLayoutsAtom())['tab-1'].desktop).toEqual([
      { i: 'mock-uuid', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    ]);
  });

  it('should number the title after the existing vertical bar charts only', () => {
    const store = createStoreWithWidgets([
      makeBarChartWidget('vertical-chart', BarChartLayout.VERTICAL),
      makeBarChartWidget('horizontal-chart', BarChartLayout.HORIZONTAL),
    ]);
    const { result } = renderCreateGraphHook(store);

    act(() => {
      result.current.createPageLayoutGraphWidget({});
    });

    const widgets = store.get(getDraftAtom()).tabs[0].widgets;

    expect(widgets).toHaveLength(3);
    expect(widgets[2]).toMatchObject({
      title: 'Vertical Bar Chart 2',
      objectMetadataId: null,
    });
    expect(widgets[2].configuration).not.toHaveProperty(
      'dashboardFilterBindings',
    );
  });

  it('should bind the new chart to the custom dashboard filters the other charts bind', () => {
    const dateSlot: DashboardFilterSlot = {
      id: 'date-slot',
      label: 'Date',
      filterType: 'DATE_TIME',
    };
    const ownerSlot: DashboardFilterSlot = {
      id: 'owner-slot',
      label: 'Owner',
      filterType: 'RELATION',
    };
    const companyChart = {
      ...makeBarChartWidget('company-chart', BarChartLayout.VERTICAL),
      objectMetadataId: 'company-object',
    };
    companyChart.configuration = {
      ...companyChart.configuration,
      dashboardFilterBindings: {
        [dateSlot.id]: { fieldMetadataId: 'company-created-at' },
        [ownerSlot.id]: { fieldMetadataId: 'company-account-owner' },
      },
    } as PageLayoutWidget['configuration'];

    const store = createStoreWithWidgets([companyChart], [dateSlot, ownerSlot]);
    const { result } = renderCreateGraphHook(store);

    act(() => {
      result.current.createPageLayoutGraphWidget({
        fieldSelection: {
          objectMetadataId: 'person-object',
          groupByFieldMetadataIdX: 'person-created-at',
          aggregateFieldMetadataId: 'person-created-at',
        },
      });
    });

    const widgets = store.get(getDraftAtom()).tabs[0].widgets;

    expect(widgets[1].configuration).toMatchObject({
      dashboardFilterBindings: {
        [dateSlot.id]: { fieldMetadataId: 'person-created-at' },
        [ownerSlot.id]: null,
      },
    });
  });
});
