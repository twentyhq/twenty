import { type WidgetConfiguration } from '~/generated/graphql';

import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { isAggregateChartConfiguration } from '@/command-menu/pages/page-layout/utils/isAggregateChartConfiguration';
import { isBarChartConfiguration } from '@/command-menu/pages/page-layout/utils/isBarChartConfiguration';
import { isGaugeChartConfiguration } from '@/command-menu/pages/page-layout/utils/isGaugeChartConfiguration';
import { isLineChartConfiguration } from '@/command-menu/pages/page-layout/utils/isLineChartConfiguration';
import { isPieChartConfiguration } from '@/command-menu/pages/page-layout/utils/isPieChartConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';

export const isChartConfiguration = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is ChartConfiguration => {
  return (
    isBarChartConfiguration(configuration) ||
    isLineChartConfiguration(configuration) ||
    isPieChartConfiguration(configuration) ||
    isAggregateChartConfiguration(configuration) ||
    isGaugeChartConfiguration(configuration)
  );
};
