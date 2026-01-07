import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';

import { useLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartData';

const mockUseRecoilComponentValue = jest.fn();
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue',
  () => ({
    useRecoilComponentValue: () => mockUseRecoilComponentValue(),
  }),
);

describe('useLineChartData', () => {
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

  const mockData: LineChartSeries[] = [
    {
      id: 'series1',
      data: [
        { x: 'Jan', y: 100 },
        { x: 'Feb', y: 120 },
        { x: 'Mar', y: 150 },
      ],
      label: 'Sales',
      color: 'red',
    },
    {
      id: 'series2',
      data: [
        { x: 'Jan', y: 80 },
        { x: 'Feb', y: 90 },
        { x: 'Mar', y: 100 },
      ],
      label: 'Costs',
    },
  ];

  it('should enrich series with color schemes and area fill ids', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.enrichedSeries[0].label).toBe('Sales');
    expect(result.current.enrichedSeries[0].areaFillId).toBe(
      'areaFill-test-chart-series1-0',
    );

    expect(result.current.enrichedSeries[1].label).toBe('Costs');
    expect(result.current.enrichedSeries[1].areaFillId).toBe(
      'areaFill-test-chart-series2-1',
    );
  });

  it('should format data for Nivo', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.nivoData).toEqual([
      {
        id: 'series1',
        data: [
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 120 },
          { x: 'Mar', y: 150 },
        ],
      },
      {
        id: 'series2',
        data: [
          { x: 'Jan', y: 80 },
          { x: 'Feb', y: 90 },
          { x: 'Mar', y: 100 },
        ],
      },
    ]);
  });

  it('should calculate legend items with totals', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.legendItems).toEqual([
      {
        id: 'series1',
        label: 'Sales',
        color: expect.any(String),
      },
      {
        id: 'series2',
        label: 'Costs',
        color: expect.any(String),
      },
    ]);
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: [],
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.enrichedSeries).toEqual([]);
    expect(result.current.nivoData).toEqual([]);
    expect(result.current.colors).toEqual([]);
    expect(result.current.legendItems).toEqual([]);
  });

  it('should use series id as label when label is not provided', () => {
    const dataWithoutLabel: LineChartSeries[] = [
      {
        id: 'series1',
        data: [{ x: 'Jan', y: 100 }],
      },
    ];

    const { result } = renderHook(() =>
      useLineChartData({
        data: dataWithoutLabel,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.enrichedSeries[0].label).toBe('series1');
  });

  it('should filter visible data based on hidden legend ids', () => {
    mockUseRecoilComponentValue.mockReturnValue(['series2']);

    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.visibleData).toHaveLength(1);
    expect(result.current.visibleData[0].id).toBe('series1');
    expect(result.current.enrichedSeries).toHaveLength(1);
    expect(result.current.nivoData).toHaveLength(1);
  });

  it('should maintain colors after filtering', () => {
    mockUseRecoilComponentValue.mockReturnValue(['series1']);

    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.enrichedSeries[0].colorScheme.name).toBe('blue');
  });

  it('should keep all items in legend even when filtering', () => {
    mockUseRecoilComponentValue.mockReturnValue(['series1']);

    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.visibleData).toHaveLength(1);
    expect(result.current.legendItems).toHaveLength(2);
  });

  it('should maintain alignment between nivoData and colors when filtering', () => {
    mockUseRecoilComponentValue.mockReturnValue(['series1']);

    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.nivoData.length).toBe(result.current.colors.length);
    expect(result.current.nivoData.length).toBe(1);
    expect(result.current.nivoData[0].id).toBe('series2');
  });

  it('should handle hidden ids that do not exist in data', () => {
    mockUseRecoilComponentValue.mockReturnValue(['nonexistent', 'alsoNotReal']);

    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
      }),
    );

    expect(result.current.visibleData).toHaveLength(2);
    expect(result.current.enrichedSeries).toHaveLength(2);
  });
});
