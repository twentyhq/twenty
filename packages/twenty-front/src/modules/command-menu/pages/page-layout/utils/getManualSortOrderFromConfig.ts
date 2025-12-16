import {
  type ChartManualSortAxis,
  getManualSortConfigKey,
} from '@/command-menu/pages/page-layout/utils/getManualSortConfigKey';
import { isDefined } from 'twenty-shared/utils';

type ChartConfiguration =
  | { __typename?: string; [key: string]: unknown }
  | null
  | undefined;

export const getManualSortOrderFromConfig = (
  configuration: ChartConfiguration,
  axis: ChartManualSortAxis,
): string[] | undefined => {
  if (!isDefined(configuration)) return undefined;

  const configKey = getManualSortConfigKey(axis);

  if (
    axis === 'pie' &&
    configuration.__typename === 'PieChartConfiguration' &&
    'manualSortOrder' in configuration
  ) {
    return (configuration.manualSortOrder as string[] | null) ?? undefined;
  }

  if (
    (axis === 'primary' || axis === 'secondary') &&
    (configuration.__typename === 'BarChartConfiguration' ||
      configuration.__typename === 'LineChartConfiguration') &&
    configKey in configuration
  ) {
    return (configuration[configKey] as string[] | null) ?? undefined;
  }

  return undefined;
};
