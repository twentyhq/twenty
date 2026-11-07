import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_REQUIRED_KEYS_BY_CONFIGURATION_TYPE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const isChartConfigurationMissingRequiredFields = (
  configuration: ChartConfiguration,
): boolean => {
  const configurationValues: Record<string, unknown> = configuration;

  return Object.keys(
    CHART_CONFIGURATION_REQUIRED_KEYS_BY_CONFIGURATION_TYPE[
      configuration.configurationType
    ],
  ).some((key) => {
    const value = configurationValues[key];

    return !isDefined(value) || value === '';
  });
};
