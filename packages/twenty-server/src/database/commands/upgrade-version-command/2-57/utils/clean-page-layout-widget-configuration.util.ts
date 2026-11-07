import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  CHART_CONFIGURATION_KEYS_BY_TYPE,
  NULLABLE_CONFIGURATION_KEYS_BY_TYPE,
} from 'src/database/commands/upgrade-version-command/2-57/clean-page-layout-widget-configuration-keys.constant';

export const cleanPageLayoutWidgetConfiguration = (
  configuration: unknown,
): { value: unknown; hasChanged: boolean } => {
  if (!isPlainObject(configuration)) {
    return { value: configuration, hasChanged: false };
  }

  const configurationType = String(configuration.configurationType);
  const chartKeys = CHART_CONFIGURATION_KEYS_BY_TYPE[configurationType];
  const nullableKeys = NULLABLE_CONFIGURATION_KEYS_BY_TYPE[configurationType];

  const entries = Object.entries(configuration);
  const keptEntries = entries.filter(
    ([key, value]) =>
      (isDefined(value) || (nullableKeys?.has(key) ?? false)) &&
      (!isDefined(chartKeys) || chartKeys.has(key)),
  );

  return {
    value: Object.fromEntries(keptEntries),
    hasChanged: keptEntries.length !== entries.length,
  };
};
