import { type ComputedDatum, type BarDatum } from '@nivo/bar';
import { type ThemeType } from 'twenty-ui/theme';
import { type BarChartConfig } from '../types/BarChartConfig';

export const getBarColor = (
  datum: ComputedDatum<BarDatum>,
  barConfigs: BarChartConfig[],
  theme: ThemeType,
) => {
  const bar = barConfigs.find(
    (b) => b.key === datum.id && b.indexValue === datum.indexValue,
  );
  if (!bar) {
    return theme.border.color.light;
  }
  return `url(#${bar.gradientId})`;
};
