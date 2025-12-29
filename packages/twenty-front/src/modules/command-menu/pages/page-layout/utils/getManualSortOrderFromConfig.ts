import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isDefined } from 'twenty-shared/utils';
import { type WidgetConfiguration } from '~/generated/graphql';

export const getManualSortOrderFromConfig = (
  configuration: WidgetConfiguration,
  axis?: 'primary' | 'secondary',
): string[] | undefined => {
  if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return configuration.manualSortOrder ?? undefined;
  }

  if (!isDefined(axis)) {
    return undefined;
  }

  if (
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration')
  ) {
    if (axis === 'primary') {
      return configuration.primaryAxisManualSortOrder ?? undefined;
    }

    return configuration.secondaryAxisManualSortOrder ?? undefined;
  }

  return undefined;
};
