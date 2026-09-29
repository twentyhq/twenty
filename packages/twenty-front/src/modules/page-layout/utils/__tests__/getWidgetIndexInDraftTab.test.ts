import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getWidgetIndexInDraftTab } from '@/page-layout/utils/getWidgetIndexInDraftTab';

describe('getWidgetIndexInDraftTab', () => {
  const tab = {
    widgets: [
      makeWidget('widget-c', 2),
      makeWidget('widget-a', 0),
      makeWidget('widget-b', 1),
    ],
  };

  it('should index a widget by its vertical list position', () => {
    expect(getWidgetIndexInDraftTab({ tab, widgetId: 'widget-a' })).toBe(0);
    expect(getWidgetIndexInDraftTab({ tab, widgetId: 'widget-c' })).toBe(2);
  });

  it('should return -1 for a widget outside the tab', () => {
    expect(getWidgetIndexInDraftTab({ tab, widgetId: 'widget-d' })).toBe(-1);
  });
});
