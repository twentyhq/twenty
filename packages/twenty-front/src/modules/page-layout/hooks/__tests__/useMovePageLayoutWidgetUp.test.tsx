import { useMovePageLayoutWidgetUp } from '@/page-layout/hooks/useMovePageLayoutWidgetUp';
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
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
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

describe('useMovePageLayoutWidgetUp', () => {
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

  it('should swap widget with the one above it', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);
    const widgetC = makeWidget('widget-c', 2);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB, widgetC])]),
    );

    const { result } = renderHook(
      () => useMovePageLayoutWidgetUp(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetUp('widget-b');
    });

    const draft = store.get(getDraftAtom());
    const widgets = draft.tabs[0].widgets;

    const widgetAPosition = widgets.find((w) => w.id === 'widget-a')?.position;
    const widgetBPosition = widgets.find((w) => w.id === 'widget-b')?.position;

    expect(widgetBPosition).toEqual(expect.objectContaining({ index: 0 }));
    expect(widgetAPosition).toEqual(expect.objectContaining({ index: 1 }));
  });

  it('should not change draft when widget is already at the top', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    const initialDraft = makeDraft([makeTab('tab-1', [widgetA, widgetB])]);
    store.set(getDraftAtom(), initialDraft);

    const { result } = renderHook(
      () => useMovePageLayoutWidgetUp(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetUp('widget-a');
    });

    const draft = store.get(getDraftAtom());

    expect(draft).toBe(initialDraft);
  });

  it('should not change draft when widget is not found', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const initialDraft = makeDraft([makeTab('tab-1', [widgetA])]);
    store.set(getDraftAtom(), initialDraft);

    const { result } = renderHook(
      () => useMovePageLayoutWidgetUp(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetUp('non-existent');
    });

    const draft = store.get(getDraftAtom());

    expect(draft).toBe(initialDraft);
  });

  it('should only modify the correct tab', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const tab1WidgetA = makeWidget('widget-a', 0, 'tab-1');
    const tab1WidgetB = makeWidget('widget-b', 1, 'tab-1');
    const tab2WidgetX = makeWidget('widget-x', 0, 'tab-2');

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab('tab-1', [tab1WidgetA, tab1WidgetB], 0),
        makeTab('tab-2', [tab2WidgetX], 1),
      ]),
    );

    const { result } = renderHook(
      () => useMovePageLayoutWidgetUp(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetUp('widget-b');
    });

    const draft = store.get(getDraftAtom());

    expect(draft.tabs[1].widgets[0].id).toBe('widget-x');
  });
});
