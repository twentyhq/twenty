import { useCanMovePageLayoutWidget } from '@/page-layout/hooks/useCanMovePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

type DirectionCase = {
  direction: 'up' | 'down';
  adjacentPosition: 'above' | 'below';
  edgePosition: 'first' | 'last';
  movableWidgetId: string;
  edgeWidgetId: string;
};

const DIRECTION_CASES: DirectionCase[] = [
  {
    direction: 'up',
    adjacentPosition: 'above',
    edgePosition: 'first',
    movableWidgetId: 'widget-b',
    edgeWidgetId: 'widget-a',
  },
  {
    direction: 'down',
    adjacentPosition: 'below',
    edgePosition: 'last',
    movableWidgetId: 'widget-a',
    edgeWidgetId: 'widget-b',
  },
];

describe('useCanMovePageLayoutWidget', () => {
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

  const renderCanMoveHook = (store: ReturnType<typeof createStore>) =>
    renderHook(() => useCanMovePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID), {
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
      movableWidgetId,
      edgeWidgetId,
    }) => {
      it(`should return true when widget is not the ${edgePosition} one`, () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const widgetB = makeWidget('widget-b', 1);

        store.set(
          getDraftAtom(),
          makeDraft([makeTab('tab-1', [widgetA, widgetB])]),
        );

        const { result } = renderCanMoveHook(store);

        expect(
          result.current.canMovePageLayoutWidget(movableWidgetId, direction),
        ).toBe(true);
      });

      it(`should return false when widget is the ${edgePosition} one`, () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const widgetB = makeWidget('widget-b', 1);

        store.set(
          getDraftAtom(),
          makeDraft([makeTab('tab-1', [widgetA, widgetB])]),
        );

        const { result } = renderCanMoveHook(store);

        expect(
          result.current.canMovePageLayoutWidget(edgeWidgetId, direction),
        ).toBe(false);
      });

      it('should return false when widget is not found', () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);

        store.set(getDraftAtom(), makeDraft([makeTab('tab-1', [widgetA])]));

        const { result } = renderCanMoveHook(store);

        expect(
          result.current.canMovePageLayoutWidget('non-existent', direction),
        ).toBe(false);
      });

      it('should return false for non-VERTICAL_LIST tab', () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const widgetB = makeWidget('widget-b', 1);

        store.set(
          getDraftAtom(),
          makeDraft([
            makeTab(
              'tab-1',
              [widgetA, widgetB],
              0,
              PageLayoutTabLayoutMode.CANVAS,
            ),
          ]),
        );

        const { result } = renderCanMoveHook(store);

        expect(
          result.current.canMovePageLayoutWidget(movableWidgetId, direction),
        ).toBe(false);
      });

      it('should return false for a FILL_VIEWPORT widget', () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const timelineWidget = makeTimelineWidget(1);
        const widgetB = makeWidget('widget-b', 2);

        store.set(
          getDraftAtom(),
          makeDraft([makeTab('tab-1', [widgetA, timelineWidget, widgetB])]),
        );

        const { result } = renderCanMoveHook(store);

        expect(
          result.current.canMovePageLayoutWidget('timeline-widget', direction),
        ).toBe(false);
      });

      it(`should ignore viewport-filling widgets when resolving the fit-content widget ${adjacentPosition}`, () => {
        const store = createStore();

        const widgetA = makeWidget('widget-a', 0);
        const timelineWidget = makeTimelineWidget(1);
        const widgetB = makeWidget('widget-b', 2);

        store.set(
          getDraftAtom(),
          makeDraft([makeTab('tab-1', [widgetA, timelineWidget, widgetB])]),
        );

        const { result } = renderCanMoveHook(store);

        expect(
          result.current.canMovePageLayoutWidget(movableWidgetId, direction),
        ).toBe(true);
        expect(
          result.current.canMovePageLayoutWidget(edgeWidgetId, direction),
        ).toBe(false);
      });
    },
  );

  it('should not let a preceding viewport-filling widget make the first fit-content widget movable up', () => {
    const store = createStore();

    const timelineWidget = makeTimelineWidget(0);
    const widgetA = makeWidget('widget-a', 1);
    const widgetB = makeWidget('widget-b', 2);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [timelineWidget, widgetA, widgetB])]),
    );

    const { result } = renderCanMoveHook(store);

    expect(result.current.canMovePageLayoutWidget('widget-a', 'up')).toBe(
      false,
    );
  });

  it('should return false for moving the last fit-content widget before a viewport-filling widget down', () => {
    const store = createStore();

    const fieldsWidget = makeWidget('fields-widget', 0);
    const timelineWidget = makeTimelineWidget(1);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [fieldsWidget, timelineWidget])]),
    );

    const { result } = renderCanMoveHook(store);

    expect(
      result.current.canMovePageLayoutWidget('fields-widget', 'down'),
    ).toBe(false);
  });
});
