import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { computeBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositions';
import { BarChartLayout } from '~/generated-metadata/graphql';

describe('computeBarPositions', () => {
  const defaultMargins = { top: 20, right: 20, bottom: 40, left: 60 };

  const redColorScheme = {
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
    ] as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ],
  };

  const greenColorScheme = {
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
    ] as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ],
  };

  const defaultEnrichedKeysMap = new Map<string, BarChartEnrichedKey>([
    [
      'value1',
      { key: 'value1', label: 'Value 1', colorScheme: redColorScheme },
    ],
    [
      'value2',
      { key: 'value2', label: 'Value 2', colorScheme: greenColorScheme },
    ],
  ]);

  it('returns empty array for empty data', () => {
    const result = computeBarPositions({
      data: [],
      indexBy: 'category',
      keys: ['value1'],
      enrichedKeysMap: defaultEnrichedKeysMap,
      chartWidth: 500,
      chartHeight: 300,
      margins: defaultMargins,
      layout: BarChartLayout.VERTICAL,
      groupMode: 'grouped',
      valueDomain: { min: 0, max: 100 },
      innerPadding: 2,
    });

    expect(result).toEqual([]);
  });

  it('builds grouped bars with enriched colors', () => {
    const result = computeBarPositions({
      data: [{ category: 'A', value1: 50 }],
      indexBy: 'category',
      keys: ['value1'],
      enrichedKeysMap: defaultEnrichedKeysMap,
      chartWidth: 500,
      chartHeight: 300,
      margins: defaultMargins,
      layout: BarChartLayout.VERTICAL,
      groupMode: 'grouped',
      valueDomain: { min: 0, max: 100 },
      innerPadding: 2,
    });

    expect(result).toHaveLength(1);
    expect(result[0].indexValue).toBe('A');
    expect(result[0].seriesId).toBe('value1');
    expect(result[0].value).toBe(50);
    expect(result[0].color).toBe('redSolid');
  });

  it('stacks bars in stacked mode', () => {
    const result = computeBarPositions({
      data: [{ category: 'A', value1: 50, value2: 30 }],
      indexBy: 'category',
      keys: ['value1', 'value2'],
      enrichedKeysMap: defaultEnrichedKeysMap,
      chartWidth: 500,
      chartHeight: 300,
      margins: defaultMargins,
      layout: BarChartLayout.VERTICAL,
      groupMode: 'stacked',
      valueDomain: { min: 0, max: 100 },
      innerPadding: 2,
    });

    expect(result).toHaveLength(2);
    const bar1 = result.find((bar) => bar.seriesId === 'value1');
    const bar2 = result.find((bar) => bar.seriesId === 'value2');
    expect(bar1).toBeDefined();
    expect(bar2).toBeDefined();
    expect(bar1!.y).toBeGreaterThan(bar2!.y);
  });
});
