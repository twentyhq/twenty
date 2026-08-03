import { usePieChartData } from '@/page-layout/widgets/graph/graph-widget-pie-chart/hooks/usePieChartData';
import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graph-widget-pie-chart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graph-widget-pie-chart/types/PieChartEnrichedData';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';

const mockUseAtomComponentStateValue = jest.fn();
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockUseAtomComponentStateValue(),
  }),
);

describe('usePieChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAtomComponentStateValue.mockReturnValue([]);
  });

  const mockColorRegistry: GraphColorRegistry = {
    red: {
      name: 'red',
      solid: 'redSolid',
      variations: [
        'red1',
        'red2',
        'red3',
        'red4',
        'red5',
        'red6',
        'red7',
        'red8',
        'red9',
        'red10',
        'red11',
        'red12',
      ],
    },
    blue: {
      name: 'blue',
      solid: 'blueSolid',
      variations: [
        'blue1',
        'blue2',
        'blue3',
        'blue4',
        'blue5',
        'blue6',
        'blue7',
        'blue8',
        'blue9',
        'blue10',
        'blue11',
        'blue12',
      ],
    },
  };

  const mockData: PieChartDataItemWithColor[] = [
    { key: 'item1', value: 30 },
    { key: 'item2', value: 50 },
    { key: 'item3', value: 20 },
  ];

  const colorsByKey = (enrichedData: PieChartEnrichedData[]) =>
    Object.fromEntries(
      enrichedData.map((item) => [item.key, item.colorScheme.name]),
    );

  const shadesByKey = (enrichedData: PieChartEnrichedData[]) =>
    Object.fromEntries(
      enrichedData.map((item) => [item.key, item.colorScheme.solid]),
    );

  it('should enrich data with color schemes and percentages', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedData).toHaveLength(3);
    expect(result.current.enrichedData[0]).toMatchObject({
      key: 'item1',
      value: 30,
      percentage: 30,
      colorScheme: mockColorRegistry.red,
    });
    expect(result.current.enrichedData[1].percentage).toBe(50);
    expect(result.current.enrichedData[2].percentage).toBe(20);
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: [],
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedData).toEqual([]);
  });

  it('should handle single data item', () => {
    const singleData: PieChartDataItemWithColor[] = [
      { key: 'single', value: 100 },
    ];

    const { result } = renderHook(() =>
      usePieChartData({
        data: singleData,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedData[0].percentage).toBe(100);
  });

  it('should assign automatic palette colors by alphabetical rank', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: [
          { key: 'gamma', value: 30 },
          { key: 'delta', value: 50 },
          { key: 'beta', value: 20 },
        ],
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(colorsByKey(result.current.enrichedData)).toEqual({
      gamma: 'red',
      delta: 'blue',
      beta: 'red',
    });
  });

  it('should return legend items from all data', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.legendItems).toHaveLength(3);
    expect(result.current.legendItems[0]).toMatchObject({
      id: 'item1',
      label: 'item1',
      color: 'redSolid',
    });
  });

  it('should filter enriched data based on hidden legend ids', () => {
    mockUseAtomComponentStateValue.mockReturnValue(['item2']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedData).toHaveLength(2);
    expect(result.current.enrichedData.map((item) => item.key)).toEqual([
      'item1',
      'item3',
    ]);
  });

  it('should maintain colors after filtering', () => {
    mockUseAtomComponentStateValue.mockReturnValue(['item1']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedData[0].colorScheme.name).toBe('blue');
  });

  it('should keep all items in legend even when filtering', () => {
    mockUseAtomComponentStateValue.mockReturnValue(['item1', 'item2']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedData).toHaveLength(1);
    expect(result.current.legendItems).toHaveLength(3);
  });

  it('should preserve original percentages after filtering', () => {
    mockUseAtomComponentStateValue.mockReturnValue(['item2']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedData).toHaveLength(2);
    expect(result.current.enrichedData[0].percentage).toBe(30);
    expect(result.current.enrichedData[1].percentage).toBe(20);
  });

  it('should handle hidden ids that do not exist in data', () => {
    mockUseAtomComponentStateValue.mockReturnValue([
      'nonexistent',
      'alsoNotReal',
    ]);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedData).toHaveLength(3);
  });

  it('should keep the same automatic palette color per key when item order changes', () => {
    const { result: firstOrderResult } = renderHook(() =>
      usePieChartData({
        data: [
          { key: 'gamma', value: 30 },
          { key: 'alpha', value: 50 },
          { key: 'beta', value: 20 },
        ],
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    const { result: reorderedResult } = renderHook(() =>
      usePieChartData({
        data: [
          { key: 'beta', value: 20 },
          { key: 'gamma', value: 30 },
          { key: 'alpha', value: 50 },
        ],
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    const expectedColorsByKey = {
      alpha: 'red',
      beta: 'blue',
      gamma: 'red',
    };

    expect(colorsByKey(firstOrderResult.current.enrichedData)).toEqual(
      expectedColorsByKey,
    );
    expect(colorsByKey(reorderedResult.current.enrichedData)).toEqual(
      expectedColorsByKey,
    );
  });

  it('should keep the same gradient shade per key when item order changes in explicitSingleColor mode', () => {
    const gradientItem = (
      key: string,
      value: number,
    ): PieChartDataItemWithColor => ({ key, value, color: 'blue' });

    const { result: firstOrderResult } = renderHook(() =>
      usePieChartData({
        data: [
          gradientItem('won', 30),
          gradientItem('open', 50),
          gradientItem('lost', 20),
        ],
        colorRegistry: mockColorRegistry,
        colorMode: 'explicitSingleColor',
      }),
    );

    const { result: reorderedResult } = renderHook(() =>
      usePieChartData({
        data: [
          gradientItem('lost', 20),
          gradientItem('won', 30),
          gradientItem('open', 50),
        ],
        colorRegistry: mockColorRegistry,
        colorMode: 'explicitSingleColor',
      }),
    );

    const expectedShadesByKey = {
      lost: 'blue4',
      open: 'blue6',
      won: 'blue8',
    };

    expect(shadesByKey(firstOrderResult.current.enrichedData)).toEqual(
      expectedShadesByKey,
    );
    expect(shadesByKey(reorderedResult.current.enrichedData)).toEqual(
      expectedShadesByKey,
    );
  });
});
