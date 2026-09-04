import { useMovePageLayoutWidget } from '@/page-layout/hooks/useMovePageLayoutWidget';
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
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

type DirectionCase = {
  direction: 'up' | 'down';
  adjacentPosition: 'above' | 'below';
  edgePosition: 'top' | 'bottom';
  movedWidgetId: string;
  edgeWidgetId: string;
};

const DIRECTION_CASES: DirectionCase[] = [
  {
    direction: 'up',
    adjacentPosition: 'above',
    edgePosition: 'top',
    movedWidgetId: 'widget-b',
    edgeWidgetId: 'widget-a',
  },
  {
    direction: 'down',
    adjacentPosition: 'below',
    edgePosition: 'bottom',
    movedWidgetId: 'widget-a',
    edgeWidgetId: 'widget-b',
  },
];

describe('useMovePageLayoutWidget', () => {
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
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    });

  const renderMoveHook = (store: ReturnType<typeof createStore>) =>
    renderHook(() => useMovePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID), {
      wrapper: getWrapper(store),
    });

  const makeTimelineWidget = (index: number) => ({
    ...makeWidget('timeline-widget', index),
    type: WidgetType.TIMELINE,
  });

  describe.each(DIRECTION_CASES)(
    '$direction',
    ({
      direction,
      adjacentPosition,
      edgePosition,
      movedWidgetId,
      edgeWidgetId,
    }) => {
      it(`should swap widget with the one ${adjacentPosition} it`, () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const widgetB = makeWidget('widget-b', 1);
        const widgetC = makeWidget('widget-c', 2);

        store.set(
          getDraftAtom(),
          makeDraft([makeTab('tab-1', [widgetA, widgetB, widgetC])]),
        );

        const { result } = renderMoveHook(store);

        act(() => {
          result.current.movePageLayoutWidget(movedWidgetId, direction);
        });

        const widgets = store.get(getDraftAtom()).tabs[0].widgets;

        const widgetAPosition = widgets.find(
          (widget) => widget.id === 'widget-a',
        )?.position;
        const widgetBPosition = widgets.find(
          (widget) => widget.id === 'widget-b',
        )?.position;

        expect(widgetBPosition).toEqual(expect.objectContaining({ index: 0 }));
        expect(widgetAPosition).toEqual(expect.objectContaining({ index: 1 }));
      });

      it(`should move relative to the fit-content widget ${adjacentPosition} and canonicalize the list`, () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const timelineWidget = makeTimelineWidget(1);
        const widgetB = makeWidget('widget-b', 2);

        store.set(
          getDraftAtom(),
          makeDraft([makeTab('tab-1', [widgetA, timelineWidget, widgetB])]),
        );

        const { result } = renderMoveHook(store);

        act(() => {
          result.current.movePageLayoutWidget(movedWidgetId, direction);
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

        const widgetA = makeWidget('widget-a', 0);
        const timelineWidget = makeTimelineWidget(1);
        const widgetB = makeWidget('widget-b', 2);
        const initialDraft = makeDraft([
          makeTab('tab-1', [widgetA, timelineWidget, widgetB]),
        ]);

        store.set(getDraftAtom(), initialDraft);

        const { result } = renderMoveHook(store);

        act(() => {
          result.current.movePageLayoutWidget('timeline-widget', direction);
        });

        expect(store.get(getDraftAtom())).toBe(initialDraft);
      });

      it(`should not change draft when widget is already at the ${edgePosition}`, () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const widgetB = makeWidget('widget-b', 1);

        const initialDraft = makeDraft([makeTab('tab-1', [widgetA, widgetB])]);
        store.set(getDraftAtom(), initialDraft);

        const { result } = renderMoveHook(store);

        act(() => {
          result.current.movePageLayoutWidget(edgeWidgetId, direction);
        });

        expect(store.get(getDraftAtom())).toBe(initialDraft);
      });

      it('should not change draft when widget is not found', () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const initialDraft = makeDraft([makeTab('tab-1', [widgetA])]);
        store.set(getDraftAtom(), initialDraft);

        const { result } = renderMoveHook(store);

        act(() => {
          result.current.movePageLayoutWidget('non-existent', direction);
        });

        expect(store.get(getDraftAtom())).toBe(initialDraft);
      });

      it('should only modify the correct tab', () => {
        const store = createStore();

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

        const { result } = renderMoveHook(store);

        act(() => {
          result.current.movePageLayoutWidget(movedWidgetId, direction);
        });

        expect(store.get(getDraftAtom()).tabs[1].widgets[0].id).toBe(
          'widget-x',
        );
      });
    },
  );
});
