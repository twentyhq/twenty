import { type Widget } from '../../mocks/mockWidgets';
import { convertLayoutsToWidgets } from '../convertLayoutsToWidgets';

describe('convertLayoutsToWidgets', () => {
  const mockWidgets: Widget[] = [
    {
      id: 'widget-1',
      title: 'Widget 1',
      type: 'GRAPH',
      graphType: 'number',
      data: { value: 100 },
    },
    {
      id: 'widget-2',
      title: 'Widget 2',
      type: 'GRAPH',
      graphType: 'pie',
      data: { items: [] },
    },
  ];

  it('should map layout positions to widgets', () => {
    const layouts = {
      lg: [
        { i: 'widget-1', x: 2, y: 3, w: 4, h: 5 },
        { i: 'widget-2', x: 6, y: 7, w: 8, h: 9 },
      ],
    };

    const result = convertLayoutsToWidgets(mockWidgets, layouts);

    expect(result[0].gridPosition).toEqual({
      column: 2,
      row: 3,
      columnSpan: 4,
      rowSpan: 5,
    });
    expect(result[1].gridPosition).toEqual({
      column: 6,
      row: 7,
      columnSpan: 8,
      rowSpan: 9,
    });
  });

  it('should use defaults when layout not found', () => {
    const layouts = {
      lg: [{ i: 'widget-1', x: 1, y: 1, w: 1, h: 1 }],
    };

    const result = convertLayoutsToWidgets(mockWidgets, layouts);

    expect(result[1].gridPosition).toEqual({
      column: 0,
      row: 0,
      columnSpan: 2,
      rowSpan: 2,
    });
  });

  it('should handle desktop key instead of lg', () => {
    const layouts = {
      desktop: [{ i: 'widget-1', x: 3, y: 4, w: 5, h: 6 }],
    };

    const result = convertLayoutsToWidgets(mockWidgets, layouts);

    expect(result[0].gridPosition).toEqual({
      column: 3,
      row: 4,
      columnSpan: 5,
      rowSpan: 6,
    });
  });
});
