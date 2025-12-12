import { type WaffleChartDataItem } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/types/WaffleChartDataItem';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type DatumId } from '@nivo/waffle';
import { renderHook } from '@testing-library/react';
import { useWaffleChartData } from '../useWaffleChartData';

describe('useWaffleChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockColorRegistry: GraphColorRegistry = {
    red: {
      name: 'red',
      gradient: {
        normal: ['red1', 'red2'],
        hover: ['red3', 'red4'],
      },
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
      gradient: {
        normal: ['blue1', 'blue2'],
        hover: ['blue3', 'blue4'],
      },
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

  const mockData: WaffleChartDataItem[] = [
    { id: 'item1', value: 30, label: 'label1' },
    { id: 'item2', value: 50, label: 'label2' },
    { id: 'item3', value: 20, label: 'label3' },
  ];

  it('should enrich data with color schemes and percentages', () => {
    const { result } = renderHook(() =>
      useWaffleChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData).toHaveLength(3);
    expect(result.current.enrichedData[0]).toMatchObject({
      id: 'item1',
      value: 30,
      percentage: 30,
      colorScheme: mockColorRegistry.red,
    });
    expect(result.current.enrichedData[1].percentage).toBe(50);
    expect(result.current.enrichedData[2].percentage).toBe(20);
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      useWaffleChartData({
        data: [],
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData).toEqual([]);
  });

  it('should handle single data item', () => {
    const singleData: WaffleChartDataItem[] = [{ id: 'single', value: 100, label: 'single' }];

    const { result } = renderHook(() =>
      useWaffleChartData({
        data: singleData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData[0].percentage).toBe(100);
  });

  it('should assign colors based on index', () => {
    const { result } = renderHook(() =>
      useWaffleChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData[0].colorScheme.name).toBe('red');
    expect(result.current.enrichedData[1].colorScheme.name).toBe('blue');
  });

  it('should memoize calculations', () => {
    const { result, rerender } = renderHook(
      () =>
        useWaffleChartData({
          data: mockData,
          colorRegistry: mockColorRegistry,
        }),
      { initialProps: { hoveredSliceId: null as DatumId | null } },
    );

    const firstEnrichedData = result.current.enrichedData;

    rerender({ hoveredSliceId: null as DatumId | null });

    expect(result.current.enrichedData).toBe(firstEnrichedData);
  });
});
