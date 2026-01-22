import { type BarChartConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartConfig';
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

  const mockBarConfigs: BarChartConfig[] = [
    {
      key: 'sales',
      indexValue: 'January',
      colorScheme: mockBlueColorScheme,
    },
    {
      key: 'revenue',
      indexValue: 'January',
      colorScheme: mockGreenColorScheme,
    },
    {
      key: 'sales',
      indexValue: 'February',
      colorScheme: mockBlueColorScheme,
    },
  ];

  it('should return the correct color when datum matches bar config', () => {
    const datum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const result = getBarChartColor(datum, mockBarConfigs, mockTheme);

    expect(result).toBe('#solidBlue');
  });

  it('should return different colors for different keys at same index', () => {
    const salesDatum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const revenueDatum: ComputedDatum<BarDatum> = {
      id: 'revenue',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const salesColor = getBarChartColor(salesDatum, mockBarConfigs, mockTheme);
    const revenueColor = getBarChartColor(
      revenueDatum,
      mockBarConfigs,
      mockTheme,
    );

    expect(salesColor).toBe('#solidBlue');
    expect(revenueColor).toBe('#solidGreen');
  });

  it('should return theme fallback color when no matching config is found', () => {
    const datum: ComputedDatum<BarDatum> = {
      id: 'unknown',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const result = getBarChartColor(datum, mockBarConfigs, mockTheme);

    expect(result).toBe('#fallback');
  });

  it('should return fallback color when indexValue does not match', () => {
    const datum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'March',
    } as unknown as ComputedDatum<BarDatum>;

    const result = getBarChartColor(datum, mockBarConfigs, mockTheme);

    expect(result).toBe('#fallback');
  });

  it('should return fallback color when barConfigs is empty', () => {
    const datum: ComputedDatum<BarDatum> = {
      id: 'sales',
      indexValue: 'January',
    } as unknown as ComputedDatum<BarDatum>;

    const result = getBarChartColor(datum, [], mockTheme);

    expect(result).toBe('#fallback');
  });

  it('should match based on both key and indexValue', () => {
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
      mockBarConfigs,
      mockTheme,
    );
    const februaryColor = getBarChartColor(
      februaryDatum,
      mockBarConfigs,
      mockTheme,
    );

    expect(januaryColor).toBe('#solidBlue');
    expect(februaryColor).toBe('#solidBlue');
  });
});
