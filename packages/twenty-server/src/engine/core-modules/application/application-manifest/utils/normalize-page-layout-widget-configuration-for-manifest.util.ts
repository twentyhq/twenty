import { type PageLayoutWidgetUniversalConfiguration } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type UniversalConfigurationOf<TConfigurationType> = Extract<
  PageLayoutWidgetUniversalConfiguration,
  { configurationType: TConfigurationType }
>;

type ConfigurationKeys<TConfigurationType> = Record<
  keyof UniversalConfigurationOf<TConfigurationType>,
  true
>;

type NullableKeysOf<TConfiguration> = TConfiguration extends unknown
  ? {
      [TKey in keyof TConfiguration]-?: null extends TConfiguration[TKey]
        ? TKey
        : never;
    }[keyof TConfiguration]
  : never;

type NullableConfigurationKey = Exclude<
  NullableKeysOf<PageLayoutWidgetUniversalConfiguration>,
  `${string}UniversalIdentifier`
>;

const BASE_CHART_KEYS = {
  configurationType: true,
  aggregateFieldMetadataUniversalIdentifier: true,
  aggregateOperation: true,
  displayDataLabel: true,
  description: true,
  color: true,
  filter: true,
  timezone: true,
  firstDayOfTheWeek: true,
} as const;

const AXIS_CHART_KEYS = {
  ...BASE_CHART_KEYS,
  primaryAxisGroupByFieldMetadataUniversalIdentifier: true,
  primaryAxisGroupBySubFieldName: true,
  primaryAxisDateGranularity: true,
  primaryAxisOrderBy: true,
  primaryAxisManualSortOrder: true,
  secondaryAxisGroupByFieldMetadataUniversalIdentifier: true,
  secondaryAxisGroupBySubFieldName: true,
  secondaryAxisGroupByDateGranularity: true,
  secondaryAxisOrderBy: true,
  secondaryAxisManualSortOrder: true,
  omitNullValues: true,
  splitMultiValueFields: true,
  axisNameDisplay: true,
  displayLegend: true,
  numberFormat: true,
  rangeMin: true,
  rangeMax: true,
  isCumulative: true,
} as const;

// A chart keeps the settings of the types it was switched from; write only its own type's keys
const CHART_CONFIGURATION_KEYS: Record<string, Record<string, true>> = {
  AGGREGATE_CHART: {
    ...BASE_CHART_KEYS,
    label: true,
    numberFormat: true,
    prefix: true,
    suffix: true,
    ratioAggregateConfig: true,
  } satisfies ConfigurationKeys<'AGGREGATE_CHART'>,
  PIE_CHART: {
    ...BASE_CHART_KEYS,
    groupByFieldMetadataUniversalIdentifier: true,
    groupBySubFieldName: true,
    dateGranularity: true,
    orderBy: true,
    manualSortOrder: true,
    showCenterMetric: true,
    displayLegend: true,
    hideEmptyCategory: true,
    numberFormat: true,
    splitMultiValueFields: true,
  } satisfies ConfigurationKeys<'PIE_CHART'>,
  BAR_CHART: {
    ...AXIS_CHART_KEYS,
    groupMode: true,
    layout: true,
  } satisfies ConfigurationKeys<'BAR_CHART'>,
  LINE_CHART: {
    ...AXIS_CHART_KEYS,
    isStacked: true,
  } satisfies ConfigurationKeys<'LINE_CHART'>,
};

const NULLABLE_CONFIGURATION_KEYS: Record<string, true> = {
  newFieldDefaultVisibility: true,
  nestedRelationFieldMetadataId: true,
} satisfies Record<NullableConfigurationKey, true>;

// References are nullable because they may point at entities that no longer exist
const isNullableConfigurationKey = (key: string) =>
  key.endsWith('UniversalIdentifier') ||
  NULLABLE_CONFIGURATION_KEYS[key] === true;

// A cleared setting is null in the UI and absent in manifests; both leave it unset
export const normalizePageLayoutWidgetConfigurationForManifest = (
  configuration: PageLayoutWidgetUniversalConfiguration,
): PageLayoutWidgetUniversalConfiguration => {
  if (!isPlainObject(configuration)) {
    return configuration;
  }

  const chartKeys = isDefined(configuration.configurationType)
    ? CHART_CONFIGURATION_KEYS[String(configuration.configurationType)]
    : undefined;

  return Object.fromEntries(
    Object.entries(configuration).filter(
      ([key, value]) =>
        (value !== null || isNullableConfigurationKey(key)) &&
        (!isDefined(chartKeys) || chartKeys[key] === true),
    ),
  ) as PageLayoutWidgetUniversalConfiguration;
};
