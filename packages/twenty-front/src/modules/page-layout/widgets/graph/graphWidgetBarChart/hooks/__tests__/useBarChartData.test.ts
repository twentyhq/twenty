import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { renderHook } from '@testing-library/react';

const mockUseRecoilComponentValue = jest.fn();
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue',
  () => ({
    useRecoilComponentValue: () => mockUseRecoilComponentValue(),
  }),
);

describe('useBarChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRecoilComponentValue.mockReturnValue([]);
  });

  const mockColorRegistry: GraphColorRegistry = {
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
    purple: {
      name: 'purple',
      solid: 'purpleSolid',
      variations: [
        'purple1',
        'purple2',
        'purple3',
        'purple4',
        'purple5',
        'purple6',
        'purple7',
        'purple8',
        'purple9',
        'purple10',
        'purple11',
        'purple12',
      ],
    },
  };

  const mockSeries: BarChartSeriesWithColor[] = [
    { key: 'sales', label: 'Sales', color: 'green' },
    { key: 'costs', label: 'Costs', color: 'purple' },
  ];

  it('should create series config map', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.seriesConfigMap.get('sales')).toEqual(mockSeries[0]);
    expect(result.current.seriesConfigMap.get('costs')).toEqual(mockSeries[1]);
  });

  it('should generate enriched keys map for O(1) color lookup', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedKeysMap.size).toBe(2);
    expect(result.current.enrichedKeysMap.get('sales')).toMatchObject({
      key: 'sales',
      label: 'Sales',
      colorScheme: {
        name: 'green',
      },
    });
    expect(result.current.enrichedKeysMap.get('costs')).toMatchObject({
      key: 'costs',
      label: 'Costs',
      colorScheme: {
        name: 'purple',
      },
    });
  });

  it('should create enriched keys with labels', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedKeys).toHaveLength(2);
    expect(result.current.enrichedKeys[0]).toMatchObject({
      key: 'sales',
      label: 'Sales',
      colorScheme: {
        name: 'green',
      },
    });
    expect(result.current.enrichedKeys[0].colorScheme.solid).toBeDefined();
    expect(result.current.enrichedKeys[1]).toMatchObject({
      key: 'costs',
      label: 'Costs',
      colorScheme: {
        name: 'purple',
      },
    });
    expect(result.current.enrichedKeys[1].colorScheme.solid).toBeDefined();
  });

  it('should use series labels when series config is not provided', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: undefined,
        colorRegistry: mockColorRegistry,
        seriesLabels: { sales: 'Revenue', costs: 'Expenses' },
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedKeys[0].label).toBe('Revenue');
    expect(result.current.enrichedKeys[1].label).toBe('Expenses');
  });

  it('should handle empty keys', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        keys: [],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedKeysMap.size).toBe(0);
    expect(result.current.enrichedKeys).toEqual([]);
  });

  it('should fall back to key name when no label is provided', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: undefined,
        colorRegistry: mockColorRegistry,
        seriesLabels: undefined,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedKeys[0].label).toBe('sales');
    expect(result.current.enrichedKeys[1].label).toBe('costs');
  });

  it('should return legend items from all keys', () => {
    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.legendItems).toHaveLength(2);
    expect(result.current.legendItems[0]).toMatchObject({
      id: 'sales',
      label: 'Sales',
      color: 'greenSolid',
    });
  });

  it('should filter visible keys based on hidden legend ids', () => {
    mockUseRecoilComponentValue.mockReturnValue(['costs']);

    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.visibleKeys).toEqual(['sales']);
    expect(result.current.enrichedKeys).toHaveLength(1);
    expect(result.current.enrichedKeys[0].key).toBe('sales');
  });

  it('should maintain colors after filtering', () => {
    mockUseRecoilComponentValue.mockReturnValue(['sales']);

    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.enrichedKeys[0].colorScheme.name).toBe('purple');
  });

  it('should keep all items in legend even when filtering', () => {
    mockUseRecoilComponentValue.mockReturnValue(['sales']);

    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.visibleKeys).toHaveLength(1);
    expect(result.current.legendItems).toHaveLength(2);
  });

  it('should handle hidden ids that do not exist in keys', () => {
    mockUseRecoilComponentValue.mockReturnValue(['nonexistent', 'alsoNotReal']);

    const { result } = renderHook(() =>
      useBarChartData({
        keys: ['sales', 'costs'],
        series: mockSeries,
        colorRegistry: mockColorRegistry,
        colorMode: 'automaticPalette',
      }),
    );

    expect(result.current.visibleKeys).toEqual(['sales', 'costs']);
    expect(result.current.enrichedKeys).toHaveLength(2);
  });
});
