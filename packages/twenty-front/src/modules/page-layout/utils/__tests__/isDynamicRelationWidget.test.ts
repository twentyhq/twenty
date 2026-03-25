import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  DYNAMIC_RELATION_WIDGET_ID_PREFIX,
  isDynamicRelationWidget,
} from '@/page-layout/utils/isDynamicRelationWidget';

const makeWidget = (id: string): PageLayoutWidget =>
  ({
    id,
    title: 'Widget',
    type: 'FIELDS',
    pageLayoutTabId: 'tab-1',
    gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    configuration: {},
  }) as PageLayoutWidget;

describe('isDynamicRelationWidget', () => {
  it('should return true for a widget with the dynamic relation prefix', () => {
    const widget = makeWidget(
      `${DYNAMIC_RELATION_WIDGET_ID_PREFIX}some-relation`,
    );

    expect(isDynamicRelationWidget(widget)).toBe(true);
  });

  it('should return false for a widget without the dynamic relation prefix', () => {
    const widget = makeWidget('regular-widget-id');

    expect(isDynamicRelationWidget(widget)).toBe(false);
  });

  it('should return false for a widget with a similar but different prefix', () => {
    const widget = makeWidget('dynamic-relation-other-widget-123');

    expect(isDynamicRelationWidget(widget)).toBe(false);
  });

  it('should return true for the prefix alone as id', () => {
    const widget = makeWidget(DYNAMIC_RELATION_WIDGET_ID_PREFIX);

    expect(isDynamicRelationWidget(widget)).toBe(true);
  });
});
