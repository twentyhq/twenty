import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';
import { type ThemeType } from 'twenty-ui/theme';
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

  const mockTheme = { name: 'light' } as ThemeType;

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

  it('should create data map', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
      }),
    );

    expect(result.current.dataMap.series1).toBe(mockData[0]);
    expect(result.current.dataMap.series2).toBe(mockData[1]);
  });

  it('should enrich series with color schemes', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
      }),
    );

    expect(result.current.enrichedSeries[0].gradientId).toBe(
      'lineGradient-test-chart-instance-1-series1-0',
    );
    expect(result.current.enrichedSeries[0].label).toBe('Sales');

    expect(result.current.enrichedSeries[1].label).toBe('Costs');
  });

  it('should handle enableArea per series', () => {
    const dataWithArea: LineChartSeries[] = [
      { ...mockData[0], enableArea: true },
      { ...mockData[1], enableArea: false },
    ];

    const { result } = renderHook(() =>
      useLineChartData({
        data: dataWithArea,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: true,
        theme: mockTheme,
      }),
    );

    expect(result.current.enrichedSeries[0].shouldEnableArea).toBe(true);
    expect(result.current.enrichedSeries[1].shouldEnableArea).toBe(false);
  });

  it('should use global enableArea when series does not specify', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: true,
        theme: mockTheme,
      }),
    );

    expect(result.current.enrichedSeries[0].shouldEnableArea).toBe(true);
    expect(result.current.enrichedSeries[1].shouldEnableArea).toBe(true);
  });

  it('should format data for Nivo', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
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

  it('should generate defs only for series with area enabled', () => {
    const dataWithArea: LineChartSeries[] = [
      { ...mockData[0], enableArea: true },
      { ...mockData[1], enableArea: false },
    ];

    const { result } = renderHook(() =>
      useLineChartData({
        data: dataWithArea,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
      }),
    );

    expect(result.current.defs).toHaveLength(1);
    expect(result.current.defs[0].id).toBe(
      'lineGradient-test-chart-instance-1-series1-0',
    );
  });

  it('should reverse gradient for light theme', () => {
    const dataWithArea: LineChartSeries[] = [
      { ...mockData[0], enableArea: true },
    ];

    const { result } = renderHook(() =>
      useLineChartData({
        data: dataWithArea,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
      }),
    );

    expect(result.current.defs[0].colors).toEqual([
      { offset: 0, color: 'red2' },
      { offset: 100, color: 'red1' },
    ]);
  });

  it('should not reverse gradient for dark theme', () => {
    const dataWithArea: LineChartSeries[] = [
      { ...mockData[0], enableArea: true },
    ];

    const darkTheme = { name: 'dark' } as ThemeType;

    const { result } = renderHook(() =>
      useLineChartData({
        data: dataWithArea,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: darkTheme,
      }),
    );

    expect(result.current.defs[0].colors).toEqual([
      { offset: 0, color: 'red1' },
      { offset: 100, color: 'red2' },
    ]);
  });

  it('should generate fill configuration', () => {
    const dataWithArea: LineChartSeries[] = [
      { ...mockData[0], enableArea: true },
      { ...mockData[1], enableArea: true },
    ];

    const { result } = renderHook(() =>
      useLineChartData({
        data: dataWithArea,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
      }),
    );

    expect(result.current.fill).toEqual([
      {
        match: { id: 'series1' },
        id: 'lineGradient-test-chart-instance-1-series1-0',
      },
      {
        match: { id: 'series2' },
        id: 'lineGradient-test-chart-instance-1-series2-1',
      },
    ]);
  });

  it('should calculate legend items with totals', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: mockData,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
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

  it('should detect clickable items', () => {
    const dataWithLinks: LineChartSeries[] = [
      {
        id: 'series1',
        data: [
          { x: 'Jan', y: 100, to: '/january' },
          { x: 'Feb', y: 120 },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useLineChartData({
        data: dataWithLinks,
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
      }),
    );

    expect(result.current.hasClickableItems).toBe(true);
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        data: [],
        colorRegistry: mockColorRegistry,
        id: 'test-chart',
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
      }),
    );

    expect(result.current.dataMap).toEqual({});
    expect(result.current.enrichedSeries).toEqual([]);
    expect(result.current.nivoData).toEqual([]);
    expect(result.current.defs).toEqual([]);
    expect(result.current.fill).toEqual([]);
    expect(result.current.colors).toEqual([]);
    expect(result.current.legendItems).toEqual([]);
    expect(result.current.hasClickableItems).toBe(false);
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
        instanceId: 'instance-1',
        enableArea: false,
        theme: mockTheme,
      }),
    );

    expect(result.current.enrichedSeries[0].label).toBe('series1');
  });
});
