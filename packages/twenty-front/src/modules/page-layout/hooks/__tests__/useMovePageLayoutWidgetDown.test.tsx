import { useMovePageLayoutWidgetDown } from '@/page-layout/hooks/useMovePageLayoutWidgetDown';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { WidgetType } from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

describe('useMovePageLayoutWidgetDown', () => {
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

  it('should swap widget with the one below it', () => {
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
      () => useMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetDown('widget-a');
    });

    const draft = store.get(getDraftAtom());
    const widgets = draft.tabs[0].widgets;

    const widgetAPosition = widgets.find((w) => w.id === 'widget-a')?.position;
    const widgetBPosition = widgets.find((w) => w.id === 'widget-b')?.position;

    expect(widgetAPosition).toEqual(expect.objectContaining({ index: 1 }));
    expect(widgetBPosition).toEqual(expect.objectContaining({ index: 0 }));
  });

  it('should move relative to the fit-content widget below and canonicalize the list', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const timelineWidget = {
      ...makeWidget('timeline-widget', 1),
      type: WidgetType.TIMELINE,
    };
    const widgetB = makeWidget('widget-b', 2);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, timelineWidget, widgetB])]),
    );

    const { result } = renderHook(
      () => useMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetDown('widget-a');
    });

    const draft = store.get(getDraftAtom());

    expect(draft.tabs[0].widgets.map((widget) => widget.id)).toEqual([
      'widget-b',
      'widget-a',
      'timeline-widget',
    ]);
    expect(
      draft.tabs[0].widgets.map((widget) =>
        widget.position && 'index' in widget.position
          ? widget.position.index
          : undefined,
      ),
    ).toEqual([0, 1, 2]);
  });

  it('should not move a viewport-filling widget', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const timelineWidget = {
      ...makeWidget('timeline-widget', 1),
      type: WidgetType.TIMELINE,
    };
    const widgetB = makeWidget('widget-b', 2);
    const initialDraft = makeDraft([
      makeTab('tab-1', [widgetA, timelineWidget, widgetB]),
    ]);

    store.set(getDraftAtom(), initialDraft);

    const { result } = renderHook(
      () => useMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetDown('timeline-widget');
    });

    expect(store.get(getDraftAtom())).toBe(initialDraft);
  });

  it('should not change draft when widget is at the bottom', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    const initialDraft = makeDraft([makeTab('tab-1', [widgetA, widgetB])]);
    store.set(getDraftAtom(), initialDraft);

    const { result } = renderHook(
      () => useMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetDown('widget-b');
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
      () => useMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetDown('non-existent');
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
      () => useMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    act(() => {
      result.current.movePageLayoutWidgetDown('widget-a');
    });

    const draft = store.get(getDraftAtom());

    expect(draft.tabs[1].widgets[0].id).toBe('widget-x');
  });
});
