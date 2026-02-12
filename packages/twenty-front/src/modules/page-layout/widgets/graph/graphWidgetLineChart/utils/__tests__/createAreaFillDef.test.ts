import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { createAreaFillDef } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/createAreaFillDef';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

describe('createAreaFillDef', () => {
  const mockColorScheme: GraphColorScheme = {
    name: 'blue',
    solid: '#solid',
    variations: [
      '#v0',
      '#v1',
      '#v2',
      '#v3',
      '#v4',
      '#v5',
      '#v6',
      '#v7',
      '#v8',
      '#v9',
      '#v10',
      '#v11',
    ],
  };

  it('should create a linear gradient definition with correct structure', () => {
    const result = createAreaFillDef(mockColorScheme, 'area-gradient-1');

    expect(result.id).toBe('area-gradient-1');
    expect(result.type).toBe('linearGradient');
    expect(result.x1).toBe('0%');
    expect(result.y1).toBe('0%');
    expect(result.x2).toBe('0%');
    expect(result.y2).toBe('100%');
  });

  it('should create gradient colors with correct opacity values', () => {
    const result = createAreaFillDef(mockColorScheme, 'test-gradient');

    expect(result.colors).toHaveLength(2);
    expect(result.colors[0]).toEqual({
      offset: 0,
      color: mockColorScheme.solid,
      opacity: LINE_CHART_CONSTANTS.AREA_FILL_START_OPACITY,
    });
    expect(result.colors[1]).toEqual({
      offset: 100,
      color: mockColorScheme.solid,
      opacity: LINE_CHART_CONSTANTS.AREA_FILL_END_OPACITY,
    });
  });

  it('should use the solid color from color scheme', () => {
    const customColorScheme: GraphColorScheme = {
      name: 'custom',
      solid: '#customSolid',
      variations: [
        '#v0',
        '#v1',
        '#v2',
        '#v3',
        '#v4',
        '#v5',
        '#v6',
        '#v7',
        '#v8',
        '#v9',
        '#v10',
        '#v11',
      ],
    };

    const result = createAreaFillDef(customColorScheme, 'custom-gradient');

    expect(result.colors[0].color).toBe('#customSolid');
    expect(result.colors[1].color).toBe('#customSolid');
  });

  it('should generate unique IDs for different gradients', () => {
    const result1 = createAreaFillDef(mockColorScheme, 'gradient-a');
    const result2 = createAreaFillDef(mockColorScheme, 'gradient-b');

    expect(result1.id).toBe('gradient-a');
    expect(result2.id).toBe('gradient-b');
    expect(result1.id).not.toBe(result2.id);
  });

  it('should create vertical gradient (top to bottom)', () => {
    const result = createAreaFillDef(mockColorScheme, 'vertical-gradient');

    expect(result.x1).toBe('0%');
    expect(result.y1).toBe('0%');
    expect(result.x2).toBe('0%');
    expect(result.y2).toBe('100%');
  });
});
