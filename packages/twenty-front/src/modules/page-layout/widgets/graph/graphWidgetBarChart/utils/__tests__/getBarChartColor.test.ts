import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { getBarChartColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartColor';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { type ThemeType } from 'twenty-ui/theme';

describe('getBarChartColor', () => {
  const mockTheme = {
    border: {
      color: {
        light: '#fallback',
      },
    },
  } as unknown as ThemeType;

  const mockBlueColorScheme: GraphColorScheme = {
    name: 'blue',
    solid: '#solidBlue',
    variations: [
      '#v0',
      '#v1',
      '#v2',
      '#v3',
      '#v4',
      '#v5',
      '#v6',
      '#v7',
      '#v8',
      '#v9',
      '#v10',
      '#v11',
    ],
  };

  const mockGreenColorScheme: GraphColorScheme = {
    name: 'green',
    solid: '#solidGreen',
    variations: [
      '#v0',
      '#v1',
      '#v2',
      '#v3',
      '#v4',
      '#v5',
      '#v6',
      '#v7',
      '#v8',
      '#v9',
      '#v10',
      '#v11',
    ],
  };

  const mockEnrichedKeysMap = new Map<string, BarChartEnrichedKey>([
    [
      'sales',
      {
        key: 'sales',
        label: 'Sales',
        colorScheme: mockBlueColorScheme,
      },
    ],
    [
      'revenue',
      {
        key: 'revenue',
        label: 'Revenue',
        colorScheme: mockGreenColorScheme,
      },
    ],
  ]);

  it('should return the correct color when datum matches enriched key', () => {
    const datum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const result = getBarChartColor(datum, mockEnrichedKeysMap, mockTheme);

    expect(result).toBe('#solidBlue');
  });

  it('should return different colors for different keys', () => {
    const salesDatum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const revenueDatum: ComputedDatum<BarDatum> = {
      id: 'revenue',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const salesColor = getBarChartColor(
      salesDatum,
      mockEnrichedKeysMap,
      mockTheme,
    );
    const revenueColor = getBarChartColor(
      revenueDatum,
      mockEnrichedKeysMap,
      mockTheme,
    );

    expect(salesColor).toBe('#solidBlue');
    expect(revenueColor).toBe('#solidGreen');
  });

  it('should return theme fallback color when no matching key is found', () => {
    const datum: ComputedDatum<BarDatum> = {
      id: 'unknown',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const result = getBarChartColor(datum, mockEnrichedKeysMap, mockTheme);

    expect(result).toBe('#fallback');
  });

  it('should return fallback color when enrichedKeysMap is empty', () => {
    const datum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const result = getBarChartColor(
      datum,
      new Map<string, BarChartEnrichedKey>(),
      mockTheme,
    );

    expect(result).toBe('#fallback');
  });

  it('should return same color for same key regardless of indexValue', () => {
    const januaryDatum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const februaryDatum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'February',
    } as unknown as ComputedDatum<BarDatum>;

    const januaryColor = getBarChartColor(
      januaryDatum,
      mockEnrichedKeysMap,
      mockTheme,
    );
    const februaryColor = getBarChartColor(
      februaryDatum,
      mockEnrichedKeysMap,
      mockTheme,
    );

    expect(januaryColor).toBe('#solidBlue');
    expect(februaryColor).toBe('#solidBlue');
  });
});
