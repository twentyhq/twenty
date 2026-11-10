import isEqual from 'lodash.isequal';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  CHART_CONFIGURATION_KEYS_BY_TYPE,
  NULLABLE_CONFIGURATION_KEYS_BY_TYPE,
} from 'src/database/commands/upgrade-version-command/2-58/clean-page-layout-widget-configuration-keys.constant';

// The editor used to save configurations with the __typename GraphQL adds, at every depth
const removeTypenames = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(removeTypenames);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== '__typename')
      .map(([key, nestedValue]) => [key, removeTypenames(nestedValue)]),
  );
};

export const cleanPageLayoutWidgetConfiguration = (
  configuration: unknown,
): { value: unknown; hasChanged: boolean } => {
  if (!isPlainObject(configuration)) {
    return { value: configuration, hasChanged: false };
  }

  const configurationType = String(configuration.configurationType);
  const chartKeys = CHART_CONFIGURATION_KEYS_BY_TYPE[configurationType];
  const nullableKeys = NULLABLE_CONFIGURATION_KEYS_BY_TYPE[configurationType];

  const keptEntries = Object.entries(configuration).filter(
    ([key, value]) =>
      (isDefined(value) || (nullableKeys?.has(key) ?? false)) &&
      (!isDefined(chartKeys) || chartKeys.has(key)),
  );

  const cleanedConfiguration = removeTypenames(Object.fromEntries(keptEntries));

  return {
    value: cleanedConfiguration,
    hasChanged: !isEqual(cleanedConfiguration, configuration),
  };
};
