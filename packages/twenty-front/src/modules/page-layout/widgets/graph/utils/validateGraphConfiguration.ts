import { type RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { GraphType } from '@/page-layout/mocks/mockWidgets';
import { type BarChartConfiguration } from '@/page-layout/widgets/graph/types/BarChartConfiguration';
import { type GaugeChartConfiguration } from '@/page-layout/widgets/graph/types/GaugeChartConfiguration';
import { GraphOrderBy } from '@/page-layout/widgets/graph/types/GraphOrderBy';
import { type GraphWidgetConfiguration } from '@/page-layout/widgets/graph/types/GraphWidgetConfiguration';
import { type LineChartConfiguration } from '@/page-layout/widgets/graph/types/LineChartConfiguration';
import { type NumberChartConfiguration } from '@/page-layout/widgets/graph/types/NumberChartConfiguration';
import { type PieChartConfiguration } from '@/page-layout/widgets/graph/types/PieChartConfiguration';
import { isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const isValidGraphOrderBy = (value: unknown): value is GraphOrderBy => {
  return Object.values(GraphOrderBy).includes(value as GraphOrderBy);
};

const isValidAggregateOperation = (
  value: unknown,
): value is AggregateOperations => {
  return Object.values(AggregateOperations).includes(
    value as AggregateOperations,
  );
};

const isValidFilter = (
  value: unknown,
): value is RecordGqlOperationFilter | undefined => {
  return value === undefined || isObject(value);
};

const isValidBarChartConfiguration = (
  config: Record<string, unknown>,
): config is BarChartConfiguration => {
  return (
    config.graphType === GraphType.BAR &&
    isString(config.groupByFieldMetadataIdX) &&
    isValidGraphOrderBy(config.orderByX) &&
    isString(config.aggregateFieldMetadataId) &&
    isValidAggregateOperation(config.aggregateOperation) &&
    isValidFilter(config.filter) &&
    (config.groupByFieldMetadataIdY === undefined ||
      isString(config.groupByFieldMetadataIdY)) &&
    (config.orderByY === undefined || isValidGraphOrderBy(config.orderByY)) &&
    (config.omitNullValues === undefined ||
      typeof config.omitNullValues === 'boolean') &&
    (config.xAxisName === undefined || isString(config.xAxisName)) &&
    (config.yAxisName === undefined || isString(config.yAxisName)) &&
    (config.rangeMin === undefined || typeof config.rangeMin === 'number') &&
    (config.rangeMax === undefined || typeof config.rangeMax === 'number') &&
    (config.description === undefined || isString(config.description)) &&
    (config.color === undefined || isString(config.color))
  );
};

const isValidLineChartConfiguration = (
  config: Record<string, unknown>,
): config is LineChartConfiguration => {
  return (
    config.graphType === GraphType.LINE &&
    isString(config.groupByFieldMetadataIdX) &&
    isValidGraphOrderBy(config.orderByX) &&
    isString(config.aggregateFieldMetadataId) &&
    isValidAggregateOperation(config.aggregateOperation) &&
    isValidFilter(config.filter) &&
    (config.groupByFieldMetadataIdY === undefined ||
      isString(config.groupByFieldMetadataIdY)) &&
    (config.orderByY === undefined || isValidGraphOrderBy(config.orderByY)) &&
    (config.omitNullValues === undefined ||
      typeof config.omitNullValues === 'boolean') &&
    (config.xAxisName === undefined || isString(config.xAxisName)) &&
    (config.yAxisName === undefined || isString(config.yAxisName)) &&
    (config.rangeMin === undefined || typeof config.rangeMin === 'number') &&
    (config.rangeMax === undefined || typeof config.rangeMax === 'number') &&
    (config.description === undefined || isString(config.description)) &&
    (config.color === undefined || isString(config.color))
  );
};

const isValidPieChartConfiguration = (
  config: Record<string, unknown>,
): config is PieChartConfiguration => {
  return (
    config.graphType === GraphType.PIE &&
    isString(config.groupByFieldMetadataId) &&
    isValidGraphOrderBy(config.orderBy) &&
    isString(config.aggregateFieldMetadataId) &&
    isValidAggregateOperation(config.aggregateOperation) &&
    isValidFilter(config.filter) &&
    (config.description === undefined || isString(config.description)) &&
    (config.color === undefined || isString(config.color))
  );
};

const isValidNumberChartConfiguration = (
  config: Record<string, unknown>,
): config is NumberChartConfiguration => {
  return (
    config.graphType === GraphType.NUMBER &&
    isString(config.aggregateFieldMetadataId) &&
    isValidAggregateOperation(config.aggregateOperation) &&
    isValidFilter(config.filter) &&
    (config.description === undefined || isString(config.description))
  );
};

const isValidGaugeChartConfiguration = (
  config: Record<string, unknown>,
): config is GaugeChartConfiguration => {
  return (
    config.graphType === GraphType.GAUGE &&
    isString(config.aggregateFieldMetadataId) &&
    isValidAggregateOperation(config.aggregateOperation) &&
    isString(config.aggregateFieldMetadataIdTotal) &&
    isValidAggregateOperation(config.aggregateOperationTotal) &&
    isValidFilter(config.filter) &&
    (config.description === undefined || isString(config.description))
  );
};

export const validateGraphConfiguration = (
  config: unknown,
): GraphWidgetConfiguration | null => {
  if (!isObject(config)) {
    return null;
  }

  if (!('graphType' in config) || !isDefined(config.graphType)) {
    return null;
  }

  const typedConfig = config as Record<string, unknown>;

  switch (typedConfig.graphType) {
    case GraphType.BAR:
      if (isValidBarChartConfiguration(typedConfig)) {
        return typedConfig;
      }
      break;
    case GraphType.LINE:
      if (isValidLineChartConfiguration(typedConfig)) {
        return typedConfig;
      }
      break;
    case GraphType.PIE:
      if (isValidPieChartConfiguration(typedConfig)) {
        return typedConfig;
      }
      break;
    case GraphType.NUMBER:
      if (isValidNumberChartConfiguration(typedConfig)) {
        return typedConfig;
      }
      break;
    case GraphType.GAUGE:
      if (isValidGaugeChartConfiguration(typedConfig)) {
        return typedConfig;
      }
      break;
  }

  return null;
};
