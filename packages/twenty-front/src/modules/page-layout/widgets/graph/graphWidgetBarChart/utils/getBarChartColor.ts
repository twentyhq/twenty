import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { type ThemeType } from 'twenty-ui/theme';

export const getBarChartColor = (
  datum: ComputedDatum<BarDatum>,
  enrichedKeysMap: Map<string, BarChartEnrichedKey>,
  theme: ThemeType,
) => {
  const enrichedKey = enrichedKeysMap.get(String(datum.id));
  if (!enrichedKey) {
    return theme.border.color.light;
  }
  return enrichedKey.colorScheme.solid;
};
