import { type GaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/types/GaugeChartData';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';
import { useGaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/hooks/useGaugeChartData';

describe('useGaugeChartData', () => {
  const mockColorRegistry: GraphColorRegistry = {
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
    green: {
      name: 'green',
      solid: 'greenSolid',
      variations: [
        'green1',
        'green2',
        'green3',
        'green4',
        'green5',
        'green6',
        'green7',
        'green8',
        'green9',
        'green10',
        'green11',
        'green12',
      ],
    },
  };

  it('should calculate normalized value correctly', () => {
    const data: GaugeChartData = {
      value: 75,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.normalizedValue).toBe(75);
    expect(result.current.clampedNormalizedValue).toBe(75);
  });

  it('should handle min and max with non-zero min', () => {
    const data: GaugeChartData = {
      value: 150,
      min: 100,
      max: 200,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.normalizedValue).toBe(50);
    expect(result.current.clampedNormalizedValue).toBe(50);
  });

  it('should clamp values above 100', () => {
    const data: GaugeChartData = {
      value: 150,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.normalizedValue).toBe(150);
    expect(result.current.clampedNormalizedValue).toBe(100);
  });

  it('should clamp values below 0', () => {
    const data: GaugeChartData = {
      value: -25,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.normalizedValue).toBe(-25);
    expect(result.current.clampedNormalizedValue).toBe(0);
  });

  it('should handle equal min and max', () => {
    const data: GaugeChartData = {
      value: 50,
      min: 100,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.normalizedValue).toBe(0);
    expect(result.current.clampedNormalizedValue).toBe(0);
  });

  it('should use custom color when provided', () => {
    const data: GaugeChartData = {
      value: 50,
      min: 0,
      max: 100,
      color: 'green',
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.colorScheme).toBe(mockColorRegistry.green);
  });

  it('should default to blue color when not provided', () => {
    const data: GaugeChartData = {
      value: 50,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.colorScheme).toBe(mockColorRegistry.blue);
  });

  it('should generate correct chart data structure', () => {
    const data: GaugeChartData = {
      value: 30,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.chartData).toEqual([
      {
        id: 'gauge',
        data: [
          { x: 'value', y: 30 },
          { x: 'empty', y: 70 },
        ],
      },
    ]);
  });

  it('should memoize calculations', () => {
    const data: GaugeChartData = {
      value: 50,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
      }),
    );

    const firstColorScheme = result.current.colorScheme;
    const firstChartData = result.current.chartData;

    expect(result.current.colorScheme).toBe(firstColorScheme);
    expect(result.current.chartData).toBe(firstChartData);
  });
});
