import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { isFieldOrNestedFieldDateKind } from '@/command-menu/pages/page-layout/utils/isFieldOrNestedFieldDateKind';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { BarChartGroupMode, GraphOrderBy } from '~/generated/graphql';

type BuildChartGroupByFieldConfigUpdateArgs<T extends ChartConfiguration> = {
  configuration: T;
  fieldMetadataIdKey: keyof T;
  subFieldNameKey: keyof T;
  fieldId: string | null;
  subFieldName: string | null;
  objectMetadataItem?: ObjectMetadataItem;
  objectMetadataItems?: ObjectMetadataItem[];
};

export const buildChartGroupByFieldConfigUpdate = <
  T extends ChartConfiguration,
>({
  configuration,
  fieldMetadataIdKey,
  subFieldNameKey,
  fieldId,
  subFieldName,
  objectMetadataItem,
  objectMetadataItems,
}: BuildChartGroupByFieldConfigUpdateArgs<T>) => {
  const isPrimaryAxis =
    fieldMetadataIdKey === 'primaryAxisGroupByFieldMetadataId';
  const isSecondaryAxis =
    fieldMetadataIdKey === 'secondaryAxisGroupByFieldMetadataId';
  const isPieChartGroupBy = fieldMetadataIdKey === 'groupByFieldMetadataId';

  const baseConfig = {
    [fieldMetadataIdKey]: fieldId,
    [subFieldNameKey]: subFieldName,
  };

  const isBarChart = configuration.__typename === 'BarChartConfiguration';
  const isLineChart = configuration.__typename === 'LineChartConfiguration';
  const isPieChart = configuration.__typename === 'PieChartConfiguration';

  if (isPrimaryAxis) {
    const existingOrderBy =
      isBarChart || isLineChart ? configuration.primaryAxisOrderBy : null;

    const existingDateGranularity =
      isBarChart || isLineChart
        ? configuration.primaryAxisDateGranularity
        : null;

    const isNewFieldDateType = isFieldOrNestedFieldDateKind({
      fieldId,
      subFieldName,
      objectMetadataItem,
      objectMetadataItems,
    });

    const shouldResetCumulative =
      isDefined(fieldId) &&
      isDefined(objectMetadataItem) &&
      !isNewFieldDateType &&
      (isBarChart || isLineChart);

    return {
      ...baseConfig,
      primaryAxisOrderBy: isDefined(fieldId)
        ? (existingOrderBy ?? GraphOrderBy.FIELD_ASC)
        : null,
      primaryAxisDateGranularity: isDefined(fieldId)
        ? (existingDateGranularity ?? ObjectRecordGroupByDateGranularity.DAY)
        : null,
      ...(shouldResetCumulative ? { isCumulative: false } : {}),
    };
  }

  if (isPieChartGroupBy) {
    const existingOrderBy = isPieChart ? configuration.orderBy : null;

    const existingDateGranularity = isPieChart
      ? configuration.dateGranularity
      : null;

    return {
      ...baseConfig,
      orderBy: isDefined(fieldId)
        ? (existingOrderBy ?? GraphOrderBy.FIELD_ASC)
        : null,
      dateGranularity: isDefined(fieldId)
        ? (existingDateGranularity ?? ObjectRecordGroupByDateGranularity.DAY)
        : null,
    };
  }

  if (!isSecondaryAxis) {
    return baseConfig;
  }

  if (isBarChart) {
    return {
      ...baseConfig,
      secondaryAxisOrderBy: isDefined(fieldId)
        ? (configuration.secondaryAxisOrderBy ?? GraphOrderBy.FIELD_ASC)
        : null,
      secondaryAxisGroupByDateGranularity: isDefined(fieldId)
        ? (configuration.secondaryAxisGroupByDateGranularity ??
          ObjectRecordGroupByDateGranularity.DAY)
        : null,
      groupMode: isDefined(fieldId)
        ? (configuration.groupMode ?? BarChartGroupMode.STACKED)
        : null,
    };
  }

  if (isLineChart) {
    return {
      ...baseConfig,
      secondaryAxisOrderBy: isDefined(fieldId)
        ? (configuration.secondaryAxisOrderBy ?? GraphOrderBy.FIELD_ASC)
        : null,
      secondaryAxisGroupByDateGranularity: isDefined(fieldId)
        ? (configuration.secondaryAxisGroupByDateGranularity ??
          ObjectRecordGroupByDateGranularity.DAY)
        : null,
      isStacked: isDefined(fieldId) ? (configuration.isStacked ?? true) : null,
    };
  }

  return baseConfig;
};
