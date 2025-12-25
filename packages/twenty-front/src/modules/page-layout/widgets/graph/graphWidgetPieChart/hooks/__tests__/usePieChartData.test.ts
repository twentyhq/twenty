import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';
import { usePieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartData';

const mockUseRecoilComponentValue = jest.fn();
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue',
  () => ({
    useRecoilComponentValue: () => mockUseRecoilComponentValue(),
  }),
);

describe('usePieChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRecoilComponentValue.mockReturnValue([]);
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

  const mockData: PieChartDataItem[] = [
    { id: 'item1', value: 30 },
    { id: 'item2', value: 50 },
    { id: 'item3', value: 20 },
  ];

  it('should enrich data with color schemes and percentages', () => {
    const { result } = renderHook(() =>
      usePieChartData({
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
      usePieChartData({
        data: [],
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData).toEqual([]);
  });

  it('should handle single data item', () => {
    const singleData: PieChartDataItem[] = [{ id: 'single', value: 100 }];

    const { result } = renderHook(() =>
      usePieChartData({
        data: singleData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData[0].percentage).toBe(100);
  });

  it('should assign colors based on index', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData[0].colorScheme.name).toBe('red');
    expect(result.current.enrichedData[1].colorScheme.name).toBe('blue');
  });

  it('should return legend items from all data', () => {
    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
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
    mockUseRecoilComponentValue.mockReturnValue(['item2']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData).toHaveLength(2);
    expect(result.current.enrichedData.map((d) => d.id)).toEqual([
      'item1',
      'item3',
    ]);
  });

  it('should maintain colors after filtering', () => {
    mockUseRecoilComponentValue.mockReturnValue(['item1']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData[0].colorScheme.name).toBe('blue');
  });

  it('should keep all items in legend even when filtering', () => {
    mockUseRecoilComponentValue.mockReturnValue(['item1', 'item2']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData).toHaveLength(1);
    expect(result.current.legendItems).toHaveLength(3);
  });

  it('should preserve original percentages after filtering', () => {
    mockUseRecoilComponentValue.mockReturnValue(['item2']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData).toHaveLength(2);
    expect(result.current.enrichedData[0].percentage).toBe(30);
    expect(result.current.enrichedData[1].percentage).toBe(20);
  });

  it('should handle hidden ids that do not exist in data', () => {
    mockUseRecoilComponentValue.mockReturnValue(['nonexistent', 'alsoNotReal']);

    const { result } = renderHook(() =>
      usePieChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedData).toHaveLength(3);
  });
});
