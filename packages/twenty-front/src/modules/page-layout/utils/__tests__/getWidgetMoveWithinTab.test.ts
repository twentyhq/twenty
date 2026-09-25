import {
  makeFlagGatedWidget,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getWidgetMoveWithinTab } from '@/page-layout/utils/getWidgetMoveWithinTab';
import { WidgetType } from '~/generated-metadata/graphql';

describe('getWidgetMoveWithinTab', () => {
  const widgets = [
    makeWidget('widget-a', 0),
    makeFlagGatedWidget('flag-gated-widget', 1),
    makeWidget('widget-b', 2),
    { ...makeWidget('timeline-widget', 3), type: WidgetType.TIMELINE },
  ];

  it('should move past a widget feature flags hide to the rendered neighbour', () => {
    expect(
      getWidgetMoveWithinTab({
        widgets,
        widgetId: 'widget-b',
        direction: 'up',
        featureFlags: {},
      }),
    ).toEqual({ fromIndex: 2, toIndex: 0 });
    expect(
      getWidgetMoveWithinTab({
        widgets,
        widgetId: 'widget-a',
        direction: 'down',
        featureFlags: {},
      }),
    ).toEqual({ fromIndex: 0, toIndex: 2 });
  });

  it('should swap with the adjacent widget once the flag is on', () => {
    expect(
      getWidgetMoveWithinTab({
        widgets,
        widgetId: 'widget-b',
        direction: 'up',
        featureFlags: { IS_MESSAGES_TAB_ENABLED: true },
      }),
    ).toEqual({ fromIndex: 2, toIndex: 1 });
  });

  it('should not move past the viewport-filling widget or the list ends', () => {
    expect(
      getWidgetMoveWithinTab({
        widgets,
        widgetId: 'widget-b',
        direction: 'down',
        featureFlags: {},
      }),
    ).toBeUndefined();
    expect(
      getWidgetMoveWithinTab({
        widgets,
        widgetId: 'widget-a',
        direction: 'up',
        featureFlags: {},
      }),
    ).toBeUndefined();
  });
});
