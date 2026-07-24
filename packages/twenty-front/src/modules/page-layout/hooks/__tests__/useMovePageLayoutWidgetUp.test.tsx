import { useMovePageLayoutWidgetUp } from '@/page-layout/hooks/useMovePageLayoutWidgetUp';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

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
