import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';
import { useBarChartData } from '../useBarChartData';

describe('useBarChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockColorRegistry: GraphColorRegistry = {
    green: {
      name: 'green',
      gradient: {
        normal: ['green1', 'green2'],
        hover: ['green3', 'green4'],
      },
      solid: 'greenSolid',
    },
    purple: {
      name: 'purple',
      gradient: {
        normal: ['purple1', 'purple2'],
        hover: ['purple3', 'purple4'],
      },
      solid: 'purpleSolid',
    },
  };

  const mockData: BarChartDataItem[] = [
    { month: 'Jan', sales: 100, costs: 80 },
    { month: 'Feb', sales: 120, costs: 90 },
    { month: 'Mar', sales: 150, costs: 100 },
  ];

  const mockSeries: BarChartSeries[] = [
    { key: 'sales', label: 'Sales', color: 'green' },
    { key: 'costs', label: 'Costs', color: 'purple' },
  ];

  it('should create series config map', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.seriesConfigMap.get('sales')).toEqual(mockSeries[0]);
    expect(result.current.seriesConfigMap.get('costs')).toEqual(mockSeries[1]);
  });

  it('should generate bar configs for each data point and key', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.barConfigs).toHaveLength(6);
    expect(result.current.barConfigs[0]).toMatchObject({
      key: 'sales',
      indexValue: 'Jan',
      colorScheme: mockColorRegistry.green,
    });
    expect(result.current.barConfigs[1]).toMatchObject({
      key: 'costs',
      indexValue: 'Jan',
      colorScheme: mockColorRegistry.purple,
    });
  });

  it('should create enriched keys with labels', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedKeys).toEqual([
      {
        key: 'sales',
        colorScheme: mockColorRegistry.green,
        label: 'Sales',
      },
      {
        key: 'costs',
        colorScheme: mockColorRegistry.purple,
        label: 'Costs',
      },
    ]);
  });

  it('should use series labels when series config is not provided', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: undefined,
        colorRegistry: mockColorRegistry,
        seriesLabels: { sales: 'Revenue', costs: 'Expenses' },
      }),
    );

    expect(result.current.enrichedKeys[0].label).toBe('Revenue');
    expect(result.current.enrichedKeys[1].label).toBe('Expenses');
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: [],
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.barConfigs).toEqual([]);
  });

  it('should handle empty keys', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: [],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.barConfigs).toEqual([]);
    expect(result.current.enrichedKeys).toEqual([]);
  });

  it('should fall back to key name when no label is provided', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: undefined,
        colorRegistry: mockColorRegistry,
        seriesLabels: undefined,
      }),
    );

    expect(result.current.enrichedKeys[0].label).toBe('sales');
    expect(result.current.enrichedKeys[1].label).toBe('costs');
  });
});
