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
import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  BarChartLayout,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(() => 'mock-uuid'),
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

  const createStoreWithWidgets = (widgets: PageLayoutWidget[]) => {
    const store = createStore();

    store.set(getDraftAtom(), {
      ...makeDraft([
        makeTab('tab-1', widgets, 0, PageLayoutTabLayoutMode.GRID),
      ]),
      type: PageLayoutType.DASHBOARD,
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

  it('should bind a new chart to the dashboard filter slots its object can serve', async () => {
    const companyObjectMetadataItem =
      getMockObjectMetadataItemOrThrow('company');
    const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

    const getFieldIdOrThrow = (
      objectMetadataItem: { fields: { id: string; name: string }[] },
      fieldName: string,
    ) => {
      const field = objectMetadataItem.fields.find(
        (field) => field.name === fieldName,
      );

      if (!isDefined(field)) {
        throw new Error(`Expected a ${fieldName} field`);
      }

      return field.id;
    };

    const slots: DashboardFilterSlot[] = [
      {
        id: 'date-slot',
        label: 'Date',
        filterType: 'DATE_TIME',
        defaultOperand: ViewFilterOperand.IS_RELATIVE,
      },
      {
        id: 'owner-slot',
        label: 'Owner',
        filterType: 'RELATION',
        defaultOperand: ViewFilterOperand.IS,
      },
    ];

    const companyWidget = buildDraftPageLayoutWidget({
      id: 'company-widget',
      pageLayoutTabId: 'tab-1',
      title: 'Companies',
      type: WidgetType.GRAPH,
      configuration: {
        ...buildDefaultBarChartConfiguration({}),
        dashboardFilterBindings: {
          'date-slot': {
            fieldMetadataId: getFieldIdOrThrow(
              companyObjectMetadataItem,
              'createdAt',
            ),
          },
          'owner-slot': {
            fieldMetadataId: getFieldIdOrThrow(
              companyObjectMetadataItem,
              'accountOwner',
            ),
          },
        },
      },
      position: {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 2,
      },
      objectMetadataId: companyObjectMetadataItem.id,
    });

    const store = createStoreWithWidgets([companyWidget]);

    store.set(getDraftAtom(), {
      ...store.get(getDraftAtom()),
      dashboardFilters: slots,
    });

    const { result } = renderHook(
      () =>
        useCreatePageLayoutGraphWidget({
          pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          tabListInstanceId: TAB_LIST_INSTANCE_ID,
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            <JestObjectMetadataItemSetter>
              {children}
            </JestObjectMetadataItemSetter>
          </PageLayoutTestWrapper>
        ),
      },
    );

    await waitFor(() => expect(result.current).not.toBeNull());

    act(() => {
      result.current.createPageLayoutGraphWidget({
        fieldSelection: {
          objectMetadataId: personObjectMetadataItem.id,
          groupByFieldMetadataIdX: getFieldIdOrThrow(
            personObjectMetadataItem,
            'createdAt',
          ),
          aggregateFieldMetadataId: getFieldIdOrThrow(
            personObjectMetadataItem,
            'id',
          ),
        },
      });
    });

    const widgets = store.get(getDraftAtom()).tabs[0].widgets;

    expect(widgets).toHaveLength(2);
    expect(widgets[1].configuration).toMatchObject({
      dashboardFilterBindings: {
        'date-slot': {
          fieldMetadataId: getFieldIdOrThrow(
            personObjectMetadataItem,
            'createdAt',
          ),
        },
        'owner-slot': null,
      },
    });
  });

  it('should not store bindings while the dashboard still uses the built-in filters', () => {
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

    expect(
      store.get(getDraftAtom()).tabs[0].widgets[0].configuration,
    ).not.toHaveProperty('dashboardFilterBindings');
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
  });
});
