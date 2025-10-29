import { type GaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/types/GaugeChartData';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';
import { useGaugeChartData } from '../useGaugeChartData';

describe('useGaugeChartData', () => {
  const mockColorRegistry: GraphColorRegistry = {
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
    green: {
      name: 'green',
      gradient: {
        normal: ['green1', 'green2'],
        hover: ['green3', 'green4'],
      },
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
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
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
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
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
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
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
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
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
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
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
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
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
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
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
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
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

  it('should generate gradient with correct angle', () => {
    const data: GaugeChartData = {
      value: 50,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: false,
      }),
    );

    expect(result.current.defs[0].id).toBe(
      'gaugeGradient-test-gauge-instance-1',
    );
    const expectedAngle = -45;
    const expectedRadians = (expectedAngle * Math.PI) / 180 + Math.PI / 2;
    const expectedSin = Math.sin(expectedRadians);
    const expectedCos = -Math.cos(expectedRadians);
    const expectedX1 = 50 - expectedSin * 50;
    const expectedY1 = 50 - expectedCos * 50;

    const actualX1 = parseFloat(result.current.defs[0].x1);
    const actualY1 = parseFloat(result.current.defs[0].y1);
    expect(actualX1).toBeCloseTo(expectedX1, 5);
    expect(actualY1).toBeCloseTo(expectedY1, 5);
  });

  it('should handle hover state', () => {
    const data: GaugeChartData = {
      value: 50,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
        id: 'test-gauge',
        instanceId: 'instance-1',
        isHovered: true,
      }),
    );

    expect(result.current.defs[0].colors).toEqual([
      { offset: 0, color: 'blue3' },
      { offset: 100, color: 'blue4' },
    ]);
  });

  it('should generate unique gradient id', () => {
    const data: GaugeChartData = {
      value: 50,
      min: 0,
      max: 100,
    };

    const { result } = renderHook(() =>
      useGaugeChartData({
        data,
        colorRegistry: mockColorRegistry,
        id: 'unique-id',
        instanceId: 'unique-instance',
        isHovered: false,
      }),
    );

    expect(result.current.gradientId).toBe(
      'gaugeGradient-unique-id-unique-instance',
    );
  });

  it('should memoize calculations', () => {
    const data: GaugeChartData = {
      value: 50,
      min: 0,
      max: 100,
    };

    const { result, rerender } = renderHook(
      ({ isHovered }) =>
        useGaugeChartData({
          data,
          colorRegistry: mockColorRegistry,
          id: 'test-gauge',
          instanceId: 'instance-1',
          isHovered,
        }),
      { initialProps: { isHovered: false } },
    );

    const firstColorScheme = result.current.colorScheme;
    const firstChartData = result.current.chartData;

    rerender({ isHovered: false });

    expect(result.current.colorScheme).toBe(firstColorScheme);
    expect(result.current.chartData).toBe(firstChartData);
  });
});
