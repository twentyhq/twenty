import { useCreatePageLayoutWidget } from '@/page-layout/hooks/useCreatePageLayoutWidget';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(() => 'mock-uuid'),
}));

const TAB_LIST_INSTANCE_ID = getTabListInstanceIdFromPageLayoutId(
  PAGE_LAYOUT_TEST_INSTANCE_ID,
);

const IFRAME_WIDGET_PARAMS = {
  type: WidgetType.IFRAME,
  title: 'Untitled iFrame',
  configuration: {
    configurationType: WidgetConfigurationType.IFRAME,
    url: null,
  },
};

describe('useCreatePageLayoutWidget', () => {
  const getDraftAtom = () =>
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    });

  const getCurrentLayoutsAtom = () =>
    pageLayoutCurrentLayoutsComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    });

  const getDraggedAreaAtom = () =>
    pageLayoutDraggedAreaComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    });

  const getActiveTabIdAtom = () =>
    activeTabIdComponentState.atomFamily({
      instanceId: TAB_LIST_INSTANCE_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    });

  const createStoreWithActiveGridTab = () => {
    const store = createStore();

    store.set(getDraftAtom(), {
      ...makeDraft([makeTab('tab-1', [], 0, PageLayoutTabLayoutMode.GRID)]),
      type: PageLayoutType.DASHBOARD,
    });
    store.set(getActiveTabIdAtom(), 'tab-1');

    return store;
  };

  const renderCreateHook = (store: ReturnType<typeof createStore>) =>
    renderHook(
      () =>
        useCreatePageLayoutWidget({
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

  it('should add the widget to the active tab with its type default size and isolated layouts', () => {
    const store = createStoreWithActiveGridTab();
    const { result } = renderCreateHook(store);

    act(() => {
      result.current.createPageLayoutWidget(IFRAME_WIDGET_PARAMS);
    });

    const widgets = store.get(getDraftAtom()).tabs[0].widgets;

    expect(widgets).toHaveLength(1);
    expect(widgets[0]).toMatchObject({
      id: 'mock-uuid',
      pageLayoutTabId: 'tab-1',
      type: WidgetType.IFRAME,
      title: 'Untitled iFrame',
      configuration: IFRAME_WIDGET_PARAMS.configuration,
      objectMetadataId: null,
      position: {
        __typename: 'PageLayoutWidgetGridPosition',
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 6,
        columnSpan: 6,
      },
    });

    const currentLayouts = store.get(getCurrentLayoutsAtom());

    expect(currentLayouts['tab-1'].desktop).toEqual([
      { i: 'mock-uuid', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 5 },
    ]);
    expect(currentLayouts['tab-2']).toBeUndefined();
  });

  it('should place the widget on the dragged area, grown to the type minimum, then clear the area', () => {
    const store = createStoreWithActiveGridTab();
    store.set(getDraggedAreaAtom(), { x: 2, y: 3, w: 2, h: 2 });
    const { result } = renderCreateHook(store);

    act(() => {
      result.current.createPageLayoutWidget(IFRAME_WIDGET_PARAMS);
    });

    expect(store.get(getDraftAtom()).tabs[0].widgets[0].position).toMatchObject(
      { row: 3, column: 2, rowSpan: 5, columnSpan: 4 },
    );
    expect(store.get(getDraggedAreaAtom())).toBeNull();
  });

  it('should fall back to the configuration size for a type without a widget size', () => {
    const store = createStoreWithActiveGridTab();
    const { result } = renderCreateHook(store);

    act(() => {
      result.current.createPageLayoutWidget({
        type: WidgetType.GRAPH,
        title: 'Vertical Bar Chart 1',
        configuration: buildDefaultBarChartConfiguration({}),
      });
    });

    expect(store.get(getCurrentLayoutsAtom())['tab-1'].desktop).toEqual([
      { i: 'mock-uuid', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    ]);
  });

  it('should accumulate one layout per created widget on desktop and mobile', () => {
    const store = createStoreWithActiveGridTab();
    const { result } = renderCreateHook(store);

    act(() => {
      result.current.createPageLayoutWidget(IFRAME_WIDGET_PARAMS);
      result.current.createPageLayoutWidget(IFRAME_WIDGET_PARAMS);
      result.current.createPageLayoutWidget(IFRAME_WIDGET_PARAMS);
    });

    const currentLayouts = store.get(getCurrentLayoutsAtom());

    expect(store.get(getDraftAtom()).tabs[0].widgets).toHaveLength(3);
    expect(currentLayouts['tab-1'].desktop).toHaveLength(3);
    expect(currentLayouts['tab-1'].mobile).toHaveLength(3);
  });

  it('should throw when no tab is active', () => {
    const { result } = renderCreateHook(createStore());

    expect(() => {
      result.current.createPageLayoutWidget(IFRAME_WIDGET_PARAMS);
    }).toThrow('A tab must be selected to create a new IFRAME widget');
  });
});
