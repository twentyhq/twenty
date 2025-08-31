import { type WidgetWithGridPosition } from '../convertLayoutsToWidgets';
import { convertWidgetsToLayouts } from '../convertWidgetsToLayouts';

describe('convertWidgetsToLayouts', () => {
  const mockWidgets: WidgetWithGridPosition[] = [
    {
      id: 'widget-1',
      title: 'Widget 1',
      type: 'GRAPH',
      graphType: 'number',
      data: { value: 100 },
      gridPosition: {
        column: 2,
        row: 3,
        columnSpan: 4,
        rowSpan: 5,
      },
    },
    {
      id: 'widget-2',
      title: 'Widget 2',
      type: 'GRAPH',
      graphType: 'pie',
      data: { items: [] },
      gridPosition: {
        column: 6,
        row: 7,
        columnSpan: 8,
        rowSpan: 9,
      },
    },
  ];

  it('should convert widgets to layouts', () => {
    const result = convertWidgetsToLayouts(mockWidgets);

    expect(result.lg).toEqual([
      { i: 'widget-1', x: 2, y: 3, w: 4, h: 5 },
      { i: 'widget-2', x: 6, y: 7, w: 8, h: 9 },
    ]);
    expect(result.md).toEqual(result.lg);
  });

  it('should create mobile layout with single column', () => {
    const result = convertWidgetsToLayouts(mockWidgets);

    expect(result.sm).toEqual([
      { i: 'widget-1', x: 0, y: 3, w: 1, h: 5 },
      { i: 'widget-2', x: 0, y: 7, w: 1, h: 9 },
    ]);
  });

  it('should handle empty widgets array', () => {
    const result = convertWidgetsToLayouts([]);

    expect(result).toEqual({
      lg: [],
      md: [],
      sm: [],
    });
  });
});
