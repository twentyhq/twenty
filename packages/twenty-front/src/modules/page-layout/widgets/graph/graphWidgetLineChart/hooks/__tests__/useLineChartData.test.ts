import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';

import { useLineChartData } from '../useLineChartData';

describe('useLineChartData', () => {
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

  it('should enrich series with color schemes', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
      }),
    );

    expect(result.current.enrichedSeries[0].label).toBe('Sales');

    expect(result.current.enrichedSeries[1].label).toBe('Costs');
  });

  it('should format data for Nivo', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
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
      }),
    );

    expect(result.current.enrichedSeries[0].label).toBe('series1');
  });
});
