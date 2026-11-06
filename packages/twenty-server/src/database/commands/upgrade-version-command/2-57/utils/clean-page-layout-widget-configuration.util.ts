import { isDefined, isPlainObject } from 'twenty-shared/utils';

const NULLABLE_CONFIGURATION_KEYS = new Set([
  'viewId',
  'newFieldDefaultVisibility',
  'nestedRelationFieldMetadataId',
]);

const AXIS_CHART_KEYS = [
  'configurationType',
  'aggregateFieldMetadataId',
  'aggregateOperation',
  'primaryAxisGroupByFieldMetadataId',
  'primaryAxisGroupBySubFieldName',
  'primaryAxisDateGranularity',
  'primaryAxisOrderBy',
  'primaryAxisManualSortOrder',
  'secondaryAxisGroupByFieldMetadataId',
  'secondaryAxisGroupBySubFieldName',
  'secondaryAxisGroupByDateGranularity',
  'secondaryAxisOrderBy',
  'secondaryAxisManualSortOrder',
  'omitNullValues',
  'splitMultiValueFields',
  'axisNameDisplay',
  'displayDataLabel',
  'displayLegend',
  'numberFormat',
  'rangeMin',
  'rangeMax',
  'description',
  'color',
  'filter',
  'isCumulative',
  'timezone',
  'firstDayOfTheWeek',
];

// The chart DTO properties as of 2.57; only charts switch type and keep the previous type's settings
const CHART_CONFIGURATION_KEYS_BY_TYPE: Partial<Record<string, Set<string>>> = {
  AGGREGATE_CHART: new Set([
    'configurationType',
    'aggregateFieldMetadataId',
    'aggregateOperation',
    'label',
    'displayDataLabel',
    'numberFormat',
    'description',
    'filter',
    'timezone',
    'firstDayOfTheWeek',
    'prefix',
    'suffix',
    'ratioAggregateConfig',
  ]),
  PIE_CHART: new Set([
    'configurationType',
    'aggregateFieldMetadataId',
    'aggregateOperation',
    'groupByFieldMetadataId',
    'groupBySubFieldName',
    'dateGranularity',
    'orderBy',
    'manualSortOrder',
    'displayDataLabel',
    'showCenterMetric',
    'displayLegend',
    'hideEmptyCategory',
    'numberFormat',
    'splitMultiValueFields',
    'description',
    'color',
    'filter',
    'timezone',
    'firstDayOfTheWeek',
  ]),
  BAR_CHART: new Set([...AXIS_CHART_KEYS, 'groupMode', 'layout']),
  LINE_CHART: new Set([...AXIS_CHART_KEYS, 'isStacked']),
};

export const cleanPageLayoutWidgetConfiguration = (
  configuration: unknown,
): { value: unknown; hasChanged: boolean } => {
  if (!isPlainObject(configuration)) {
    return { value: configuration, hasChanged: false };
  }

  const chartKeys =
    CHART_CONFIGURATION_KEYS_BY_TYPE[String(configuration.configurationType)];

  const entries = Object.entries(configuration);
  const keptEntries = entries.filter(
    ([key, value]) =>
      (isDefined(value) || NULLABLE_CONFIGURATION_KEYS.has(key)) &&
      (!isDefined(chartKeys) || chartKeys.has(key)),
  );

  return {
    value: Object.fromEntries(keptEntries),
    hasChanged: keptEntries.length !== entries.length,
  };
};
