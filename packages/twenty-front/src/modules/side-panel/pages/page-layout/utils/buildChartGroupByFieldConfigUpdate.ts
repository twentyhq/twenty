import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { getChartDefaultOrderByForFieldType } from '@/command-menu/pages/page-layout/utils/getChartDefaultOrderByForFieldType';
import { isFieldOrRelationNestedFieldDateKind } from '@/command-menu/pages/page-layout/utils/isFieldOrNestedFieldDateKind';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined, isFieldMetadataArrayKind } from 'twenty-shared/utils';
import { BarChartGroupMode, GraphOrderBy } from '~/generated-metadata/graphql';

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

  const isBarChart = isWidgetConfigurationOfType(
    configuration,
    'BarChartConfiguration',
  );
  const isLineChart = isWidgetConfigurationOfType(
    configuration,
    'LineChartConfiguration',
  );
  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );

  const fieldMetadataItem = objectMetadataItem?.fields?.find(
    (field) => field.id === fieldId,
  );

  const defaultOrderBy = isDefined(fieldMetadataItem?.type)
    ? getChartDefaultOrderByForFieldType(fieldMetadataItem?.type)
    : GraphOrderBy.FIELD_ASC;

  const isArrayFieldMetadataId = (
    fieldMetadataId: string | null | undefined,
  ): boolean => {
    if (!isDefined(fieldMetadataId)) {
      return false;
    }

    const candidateFieldMetadataItem = objectMetadataItem?.fields?.find(
      (field) => field.id === fieldMetadataId,
    );

    return (
      isDefined(candidateFieldMetadataItem) &&
      isFieldMetadataArrayKind(candidateFieldMetadataItem.type)
    );
  };

  if (isPrimaryAxis) {
    const existingDateGranularity =
      isBarChart || isLineChart
        ? configuration.primaryAxisDateGranularity
        : null;

    const isNewFieldDateType = isFieldOrRelationNestedFieldDateKind({
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

    const shouldDisableSplitMultiValueFields =
      (isBarChart || isLineChart) &&
      isArrayFieldMetadataId(fieldId) &&
      isArrayFieldMetadataId(configuration.secondaryAxisGroupByFieldMetadataId);

    return {
      ...baseConfig,
      primaryAxisOrderBy: isDefined(fieldId) ? defaultOrderBy : null,
      primaryAxisDateGranularity: isDefined(fieldId)
        ? (existingDateGranularity ?? ObjectRecordGroupByDateGranularity.DAY)
        : null,
      ...(shouldResetCumulative ? { isCumulative: false } : {}),
      ...(shouldDisableSplitMultiValueFields
        ? { splitMultiValueFields: false }
        : {}),
    };
  }

  if (isPieChartGroupBy) {
    const existingDateGranularity = isPieChart
      ? configuration.dateGranularity
      : null;

    return {
      ...baseConfig,
      orderBy: isDefined(fieldId) ? defaultOrderBy : null,
      dateGranularity: isDefined(fieldId)
        ? (existingDateGranularity ?? ObjectRecordGroupByDateGranularity.DAY)
        : null,
    };
  }

  if (!isSecondaryAxis) {
    return baseConfig;
  }

  if (isBarChart) {
    const shouldDisableSplitMultiValueFields =
      isArrayFieldMetadataId(configuration.primaryAxisGroupByFieldMetadataId) &&
      isArrayFieldMetadataId(fieldId);

    return {
      ...baseConfig,
      secondaryAxisOrderBy: isDefined(fieldId) ? defaultOrderBy : null,
      secondaryAxisGroupByDateGranularity: isDefined(fieldId)
        ? (configuration.secondaryAxisGroupByDateGranularity ??
          ObjectRecordGroupByDateGranularity.DAY)
        : null,
      groupMode: isDefined(fieldId)
        ? (configuration.groupMode ?? BarChartGroupMode.STACKED)
        : null,
      ...(shouldDisableSplitMultiValueFields
        ? { splitMultiValueFields: false }
        : {}),
    };
  }

  if (isLineChart) {
    const shouldDisableSplitMultiValueFields =
      isArrayFieldMetadataId(configuration.primaryAxisGroupByFieldMetadataId) &&
      isArrayFieldMetadataId(fieldId);

    return {
      ...baseConfig,
      secondaryAxisOrderBy: isDefined(fieldId) ? defaultOrderBy : null,
      secondaryAxisGroupByDateGranularity: isDefined(fieldId)
        ? (configuration.secondaryAxisGroupByDateGranularity ??
          ObjectRecordGroupByDateGranularity.DAY)
        : null,
      isStacked: isDefined(fieldId) ? (configuration.isStacked ?? true) : null,
      ...(shouldDisableSplitMultiValueFields
        ? { splitMultiValueFields: false }
        : {}),
    };
  }

  return baseConfig;
};
