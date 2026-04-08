import { useInsertCreatedWidgetAtContext } from '@/page-layout/hooks/useInsertCreatedWidgetAtContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

const makeWidget = (
  id: string,
  index: number,
  tabId: string = 'tab-1',
): PageLayoutWidget =>
  ({
    id,
    pageLayoutTabId: tabId,
    title: id,
    type: WidgetType.FIELDS,
    isOverridden: false,
    gridPosition: { column: 0, columnSpan: 1, row: 0, rowSpan: 1 },
    configuration: { __typename: 'FieldsConfiguration' as const },
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }) as unknown as PageLayoutWidget;

const makeTab = (
  id: string,
  widgets: PageLayoutWidget[],
  position: number = 0,
) => ({
  id,
  applicationId: '',
  title: id,
  position,
  pageLayoutId: '',
  widgets,
  isOverridden: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

const makeDraft = (tabs: ReturnType<typeof makeTab>[]): DraftPageLayout => ({
  id: 'test-layout',
  name: 'Test Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  tabs,
});

describe('useInsertCreatedWidgetAtContext', () => {
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

  const getDraftAtom = () =>
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  const getInsertionContextAtom = () =>
    widgetInsertionContextComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  it('should insert widget above target', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);
    const widgetC = makeWidget('widget-c', 2);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB, widgetC])]),
    );
    store.set(getInsertionContextAtom(), {
      targetWidgetId: 'widget-b',
      direction: 'above',
    });

    const { result } = renderHook(
      () => useInsertCreatedWidgetAtContext(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.insertCreatedWidgetAtContext('widget-c');
    });

    const draft = store.get(getDraftAtom());
    const widgetIds = draft.tabs[0].widgets.map((w) => w.id);

    expect(widgetIds).toEqual(['widget-a', 'widget-c', 'widget-b']);
  });

  it('should insert widget below target', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);
    const widgetC = makeWidget('widget-c', 2);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB, widgetC])]),
    );
    store.set(getInsertionContextAtom(), {
      targetWidgetId: 'widget-a',
      direction: 'below',
    });

    const { result } = renderHook(
      () => useInsertCreatedWidgetAtContext(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.insertCreatedWidgetAtContext('widget-c');
    });

    const draft = store.get(getDraftAtom());
    const widgetIds = draft.tabs[0].widgets.map((w) => w.id);

    expect(widgetIds).toEqual(['widget-a', 'widget-c', 'widget-b']);
  });

  it('should reindex all widgets with sequential positions', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);
    const widgetC = makeWidget('widget-c', 2);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB, widgetC])]),
    );
    store.set(getInsertionContextAtom(), {
      targetWidgetId: 'widget-a',
      direction: 'above',
    });

    const { result } = renderHook(
      () => useInsertCreatedWidgetAtContext(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.insertCreatedWidgetAtContext('widget-c');
    });

    const draft = store.get(getDraftAtom());
    const positions = draft.tabs[0].widgets.map((w) => w.position);

    positions.forEach((position, index) => {
      expect(position).toEqual({
        __typename: 'PageLayoutWidgetVerticalListPosition',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index,
      });
    });
  });

  it('should no-op when insertion context is null', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    const initialDraft = makeDraft([makeTab('tab-1', [widgetA, widgetB])]);
    store.set(getDraftAtom(), initialDraft);

    const { result } = renderHook(
      () => useInsertCreatedWidgetAtContext(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.insertCreatedWidgetAtContext('widget-b');
    });

    const draft = store.get(getDraftAtom());

    expect(draft).toBe(initialDraft);
  });

  it('should no-op when target widget is not found', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    const initialDraft = makeDraft([makeTab('tab-1', [widgetA, widgetB])]);
    store.set(getDraftAtom(), initialDraft);
    store.set(getInsertionContextAtom(), {
      targetWidgetId: 'non-existent',
      direction: 'above',
    });

    const { result } = renderHook(
      () => useInsertCreatedWidgetAtContext(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.insertCreatedWidgetAtContext('widget-b');
    });

    const draft = store.get(getDraftAtom());

    expect(draft).toBe(initialDraft);
  });

  it('should no-op when new widget does not exist in tab', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    const initialDraft = makeDraft([makeTab('tab-1', [widgetA, widgetB])]);
    store.set(getDraftAtom(), initialDraft);
    store.set(getInsertionContextAtom(), {
      targetWidgetId: 'widget-a',
      direction: 'below',
    });

    const { result } = renderHook(
      () => useInsertCreatedWidgetAtContext(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.insertCreatedWidgetAtContext('non-existent-widget');
    });

    const draft = store.get(getDraftAtom());
    const widgetIds = draft.tabs[0].widgets.map((w) => w.id);

    expect(widgetIds).toEqual(['widget-a', 'widget-b']);
  });

  it('should clear insertion context after insertion', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB])]),
    );
    store.set(getInsertionContextAtom(), {
      targetWidgetId: 'widget-a',
      direction: 'below',
    });

    const { result } = renderHook(
      () => useInsertCreatedWidgetAtContext(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.insertCreatedWidgetAtContext('widget-b');
    });

    const insertionContext = store.get(getInsertionContextAtom());

    expect(insertionContext).toBeNull();
  });

  it('should only modify the tab containing the target widget', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const tab1WidgetA = makeWidget('widget-a', 0, 'tab-1');
    const tab1WidgetB = makeWidget('widget-b', 1, 'tab-1');
    const tab1WidgetC = makeWidget('widget-c', 2, 'tab-1');

    const tab2WidgetX = makeWidget('widget-x', 0, 'tab-2');
    const tab2WidgetY = makeWidget('widget-y', 1, 'tab-2');

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab('tab-1', [tab1WidgetA, tab1WidgetB, tab1WidgetC], 0),
        makeTab('tab-2', [tab2WidgetX, tab2WidgetY], 1),
      ]),
    );
    store.set(getInsertionContextAtom(), {
      targetWidgetId: 'widget-a',
      direction: 'above',
    });

    const { result } = renderHook(
      () => useInsertCreatedWidgetAtContext(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.insertCreatedWidgetAtContext('widget-c');
    });

    const draft = store.get(getDraftAtom());

    const tab1WidgetIds = draft.tabs[0].widgets.map((w) => w.id);
    expect(tab1WidgetIds).toEqual(['widget-c', 'widget-a', 'widget-b']);

    const tab2WidgetIds = draft.tabs[1].widgets.map((w) => w.id);
    expect(tab2WidgetIds).toEqual(['widget-x', 'widget-y']);
  });
});
