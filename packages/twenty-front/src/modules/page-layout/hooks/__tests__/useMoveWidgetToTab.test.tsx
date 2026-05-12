import { useMoveWidgetToTab } from '@/page-layout/hooks/useMoveWidgetToTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
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
    isActive: true,
    type: WidgetType.FIELDS,
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
  isActive: true,
  position,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  pageLayoutId: '',
  widgets,
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

describe('useMoveWidgetToTab', () => {
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

  it('should move widget from source tab to destination tab', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0, 'tab-1');
    const widgetB = makeWidget('widget-b', 1, 'tab-1');
    const widgetX = makeWidget('widget-x', 0, 'tab-2');

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab('tab-1', [widgetA, widgetB], 0),
        makeTab('tab-2', [widgetX], 1),
      ]),
    );

    const { result } = renderHook(
      () => useMoveWidgetToTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.moveWidgetToTab('widget-a', 'tab-2');
    });

    const draft = store.get(getDraftAtom());

    const tab1WidgetIds = draft.tabs[0].widgets.map((w) => w.id);
    expect(tab1WidgetIds).toEqual(['widget-b']);

    const tab2WidgetIds = draft.tabs[1].widgets.map((w) => w.id);
    expect(tab2WidgetIds).toEqual(['widget-x', 'widget-a']);
  });

  it('should reindex remaining widgets in source tab', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0, 'tab-1');
    const widgetB = makeWidget('widget-b', 1, 'tab-1');
    const widgetC = makeWidget('widget-c', 2, 'tab-1');

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab('tab-1', [widgetA, widgetB, widgetC], 0),
        makeTab('tab-2', [], 1),
      ]),
    );

    const { result } = renderHook(
      () => useMoveWidgetToTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.moveWidgetToTab('widget-a', 'tab-2');
    });

    const draft = store.get(getDraftAtom());

    const tab1Positions = draft.tabs[0].widgets.map((w) => {
      if (w.position && 'index' in w.position) {
        return w.position.index;
      }
      return -1;
    });

    expect(tab1Positions).toEqual([0, 1]);
  });

  it('should set moved widget position to end of destination tab', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0, 'tab-1');
    const widgetX = makeWidget('widget-x', 0, 'tab-2');
    const widgetY = makeWidget('widget-y', 1, 'tab-2');

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab('tab-1', [widgetA], 0),
        makeTab('tab-2', [widgetX, widgetY], 1),
      ]),
    );

    const { result } = renderHook(
      () => useMoveWidgetToTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.moveWidgetToTab('widget-a', 'tab-2');
    });

    const draft = store.get(getDraftAtom());
    const movedWidget = draft.tabs[1].widgets.find((w) => w.id === 'widget-a');

    expect(movedWidget?.position).toEqual(
      expect.objectContaining({ index: 2 }),
    );
  });

  it('should not change draft when source and destination are the same tab', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0, 'tab-1');
    const widgetB = makeWidget('widget-b', 1, 'tab-1');

    const initialDraft = makeDraft([makeTab('tab-1', [widgetA, widgetB])]);
    store.set(getDraftAtom(), initialDraft);

    const { result } = renderHook(
      () => useMoveWidgetToTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.moveWidgetToTab('widget-a', 'tab-1');
    });

    const draft = store.get(getDraftAtom());

    expect(draft).toBe(initialDraft);
  });

  it('should not change draft when widget is not found', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0, 'tab-1');

    const initialDraft = makeDraft([
      makeTab('tab-1', [widgetA], 0),
      makeTab('tab-2', [], 1),
    ]);
    store.set(getDraftAtom(), initialDraft);

    const { result } = renderHook(
      () => useMoveWidgetToTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.moveWidgetToTab('non-existent', 'tab-2');
    });

    const draft = store.get(getDraftAtom());

    expect(draft).toBe(initialDraft);
  });

  it('should not change draft when destination tab is not found', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0, 'tab-1');

    const initialDraft = makeDraft([makeTab('tab-1', [widgetA])]);
    store.set(getDraftAtom(), initialDraft);

    const { result } = renderHook(
      () => useMoveWidgetToTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.moveWidgetToTab('widget-a', 'non-existent-tab');
    });

    const draft = store.get(getDraftAtom());

    expect(draft).toBe(initialDraft);
  });
});
