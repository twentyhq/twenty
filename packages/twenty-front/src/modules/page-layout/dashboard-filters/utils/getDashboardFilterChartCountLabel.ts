import { plural, t } from '@lingui/core/macro';

export const getDashboardFilterChartCountLabel = ({
  boundChartCount,
  chartCount,
}: {
  boundChartCount: number;
  chartCount: number;
}): string =>
  t`${boundChartCount} of ${plural(chartCount, {
    one: '# chart',
    other: '# charts',
  })}`;
