import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type DatumId } from '@nivo/pie';
import { renderHook } from '@testing-library/react';
import { usePieChartData } from '../usePieChartData';

describe('usePieChartData', () => {
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

  const mockData: PieChartDataItem[] = [
    { id: 'item1', value: 30, label: 'Item 1' },
    { id: 'item2', value: 50, label: 'Item 2' },
    { id: 'item3', value: 20, label: 'Item 3' },
  ];

  it('should enrich data with color schemes and percentages', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        hoveredSliceId: null,
      }),
    );

    expect(result.current.enrichedData).toHaveLength(3);
    expect(result.current.enrichedData[0]).toMatchObject({
      id: 'item1',
      value: 30,
      label: 'Item 1',
      percentage: 30,
      colorScheme: mockColorRegistry.red,
      isHovered: false,
    });
    expect(result.current.enrichedData[1].percentage).toBe(50);
    expect(result.current.enrichedData[2].percentage).toBe(20);
  });

  it('should calculate middle angles for each slice', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        hoveredSliceId: null,
      }),
    );

    expect(result.current.enrichedData[0].middleAngle).toBe(54);
    expect(result.current.enrichedData[1].middleAngle).toBe(198);
    expect(result.current.enrichedData[2].middleAngle).toBe(324);
  });

  it('should handle hover state', () => {
    const { result, rerender } = renderHook(
      ({ hoveredSliceId }: { hoveredSliceId: DatumId | null }) =>
        usePieChartData({
          data: mockData,
          colorRegistry: mockColorRegistry,
          hoveredSliceId,
        }),
      { initialProps: { hoveredSliceId: null as DatumId | null } },
    );

    expect(result.current.enrichedData[1].isHovered).toBe(false);

    rerender({ hoveredSliceId: 'item2' as DatumId });
    expect(result.current.enrichedData[1].isHovered).toBe(true);
    expect(result.current.enrichedData[0].isHovered).toBe(false);
    expect(result.current.enrichedData[2].isHovered).toBe(false);
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: [],
        colorRegistry: mockColorRegistry,
        hoveredSliceId: null,
      }),
    );

    expect(result.current.enrichedData).toEqual([]);
  });

  it('should handle single data item', () => {
    const singleData: PieChartDataItem[] = [
      { id: 'single', value: 100, label: 'Single Item' },
    ];

    const { result } = renderHook(() =>
      usePieChartData({
        data: singleData,
        colorRegistry: mockColorRegistry,
        hoveredSliceId: null,
      }),
    );

    expect(result.current.enrichedData[0].percentage).toBe(100);
    expect(result.current.enrichedData[0].middleAngle).toBe(180);
  });

  it('should handle custom colors in data items', () => {
    const dataWithColors: PieChartDataItem[] = [
      { id: 'item1', value: 50, label: 'Item 1', color: 'blue' },
      { id: 'item2', value: 50, label: 'Item 2' },
    ];

    const { result } = renderHook(() =>
      usePieChartData({
        data: dataWithColors,
        colorRegistry: mockColorRegistry,
        hoveredSliceId: null,
      }),
    );

    expect(result.current.enrichedData[0].colorScheme.name).toBe('blue');
    expect(result.current.enrichedData[1].colorScheme.name).toBe('blue');
  });

  it('should memoize calculations', () => {
    const { result, rerender } = renderHook(
      ({ hoveredSliceId }) =>
        usePieChartData({
          data: mockData,
          colorRegistry: mockColorRegistry,
          hoveredSliceId,
        }),
      { initialProps: { hoveredSliceId: null as DatumId | null } },
    );

    const firstEnrichedData = result.current.enrichedData;

    rerender({ hoveredSliceId: null as DatumId | null });

    expect(result.current.enrichedData).toBe(firstEnrichedData);
  });
});
