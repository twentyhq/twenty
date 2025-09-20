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
        id: 'test-chart',
        instanceId: 'instance-1',
        hoveredBar: null,
        layout: 'vertical',
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
        id: 'test-chart',
        instanceId: 'instance-1',
        hoveredBar: null,
        layout: 'vertical',
      }),
    );

    expect(result.current.barConfigs).toHaveLength(6);
    expect(result.current.barConfigs[0]).toMatchObject({
      key: 'sales',
      indexValue: 'Jan',
      gradientId: 'gradient-test-chart-instance-1-sales-0-0',
      colorScheme: mockColorRegistry.green,
    });
    expect(result.current.barConfigs[1]).toMatchObject({
      key: 'costs',
      indexValue: 'Jan',
      gradientId: 'gradient-test-chart-instance-1-costs-0-1',
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
        id: 'test-chart',
        instanceId: 'instance-1',
        hoveredBar: null,
        layout: 'vertical',
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
        id: 'test-chart',
        instanceId: 'instance-1',
        seriesLabels: { sales: 'Revenue', costs: 'Expenses' },
        hoveredBar: null,
        layout: 'vertical',
      }),
    );

    expect(result.current.enrichedKeys[0].label).toBe('Revenue');
    expect(result.current.enrichedKeys[1].label).toBe('Expenses');
  });

  it('should handle hover state for bars', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        hoveredBar: { key: 'sales', indexValue: 'Feb' },
        layout: 'vertical',
      }),
    );

    const hoveredDef = result.current.defs.find(
      (def) => def.id === 'gradient-test-chart-instance-1-sales-1-0',
    );
    expect(hoveredDef?.colors).toEqual([
      { offset: 0, color: 'green4' },
      { offset: 100, color: 'green3' },
    ]);
  });

  it('should generate vertical gradients for vertical layout', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        hoveredBar: null,
        layout: 'vertical',
      }),
    );

    const def = result.current.defs[0];
    expect(def.y1).toBe('0%');
    expect(def.y2).toBe('100%');
  });

  it('should generate horizontal gradients for horizontal layout', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        hoveredBar: null,
        layout: 'horizontal',
      }),
    );

    const def = result.current.defs[0];
    expect(def.x1).toBe('0%');
    expect(def.x2).toBe('100%');
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: [],
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        hoveredBar: null,
        layout: 'vertical',
      }),
    );

    expect(result.current.barConfigs).toEqual([]);
    expect(result.current.defs).toEqual([]);
  });

  it('should handle empty keys', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: [],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        hoveredBar: null,
        layout: 'vertical',
      }),
    );

    expect(result.current.barConfigs).toEqual([]);
    expect(result.current.enrichedKeys).toEqual([]);
    expect(result.current.defs).toEqual([]);
  });

  it('should fall back to key name when no label is provided', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        data: mockData,
        indexBy: 'month',
        keys: ['sales', 'costs'],
        series: undefined,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        seriesLabels: undefined,
        hoveredBar: null,
        layout: 'vertical',
      }),
    );

    expect(result.current.enrichedKeys[0].label).toBe('sales');
    expect(result.current.enrichedKeys[1].label).toBe('costs');
  });

  it('should recalculate when instanceId changes', () => {
    const { result, rerender } = renderHook(
      ({ instanceId }) =>
        useBarChartData({
          data: mockData,
          indexBy: 'month',
          keys: ['sales', 'costs'],
          series: mockSeries,
          colorRegistry: mockColorRegistry,
          id: 'test-chart',
          instanceId,
          hoveredBar: null,
          layout: 'vertical',
        }),
      { initialProps: { instanceId: 'instance-1' } },
    );

    const firstBarConfigs = result.current.barConfigs;

    rerender({ instanceId: 'instance-2' });

    expect(result.current.barConfigs).not.toBe(firstBarConfigs);
    expect(result.current.barConfigs[0].gradientId).toContain('instance-2');
  });
});
