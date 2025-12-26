import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getChartAxisNameDisplayOptions } from '@/command-menu/pages/page-layout/utils/getChartAxisNameDisplayOptions';
import { getChartFilterRulesCount } from '@/command-menu/pages/page-layout/utils/getChartFilterRulesCount';
import { getDateGranularityLabel } from '@/command-menu/pages/page-layout/utils/getDateGranularityLabel';
import { getFieldLabelWithSubField } from '@/command-menu/pages/page-layout/utils/getFieldLabelWithSubField';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { plural, t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type GraphOrderBy } from '~/generated-metadata/graphql';

export const useChartSettingsValues = ({
  objectMetadataId,
  configuration,
}: {
  objectMetadataId: string;
  configuration?: ChartConfiguration;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
  );

  const { getXSortOptionLabel } = useGraphXSortOptionLabels({
    objectMetadataId,
  });

  const { getGroupBySortOptionLabel } = useGraphGroupBySortOptionLabels({
    objectMetadataId,
  });

  if (!configuration) {
    return {
      getChartSettingsValues: () => undefined,
    };
  }

  const isBarOrLineChart =
    configuration.__typename === 'BarChartConfiguration' ||
    configuration.__typename === 'LineChartConfiguration';

  const hasColorProperty =
    isBarOrLineChart ||
    configuration.__typename === 'GaugeChartConfiguration' ||
    configuration.__typename === 'PieChartConfiguration';

  const isPieChart = configuration.__typename === 'PieChartConfiguration';

  let groupByFieldXId: string | undefined;
  let groupByFieldYId: string | undefined;
  let groupBySubFieldNameX: CompositeFieldSubFieldName | undefined;
  let groupBySubFieldNameY: CompositeFieldSubFieldName | undefined;
  let xAxisOrderBy: GraphOrderBy | undefined | null;
  let groupByOrderBy: GraphOrderBy | undefined | null;

  if (isBarOrLineChart) {
    groupByFieldXId = configuration.primaryAxisGroupByFieldMetadataId;
    groupByFieldYId = configuration.secondaryAxisGroupByFieldMetadataId;
    groupBySubFieldNameX = configuration.primaryAxisGroupBySubFieldName as
      | CompositeFieldSubFieldName
      | undefined;
    groupBySubFieldNameY = configuration.secondaryAxisGroupBySubFieldName as
      | CompositeFieldSubFieldName
      | undefined;
    xAxisOrderBy = configuration.primaryAxisOrderBy;
    groupByOrderBy = configuration.secondaryAxisOrderBy;
  }

  const groupByFieldX = isDefined(groupByFieldXId)
    ? objectMetadataItem?.fields.find((field) => field.id === groupByFieldXId)
    : undefined;

  const groupByFieldY = isDefined(groupByFieldYId)
    ? objectMetadataItem?.fields.find((field) => field.id === groupByFieldYId)
    : undefined;

  const groupBySubFieldNameXLabel =
    isDefined(groupBySubFieldNameX) && isDefined(groupByFieldX)
      ? getFieldLabelWithSubField({
          field: groupByFieldX,
          subFieldName: groupBySubFieldNameX,
          objectMetadataItems,
        })
      : undefined;

  const aggregateField = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.aggregateFieldMetadataId,
  );

  const aggregateOperation =
    convertAggregateOperationToExtendedAggregateOperation(
      configuration.aggregateOperation,
      aggregateField?.type,
    );

  const xAxisOrderByLabel =
    isDefined(xAxisOrderBy) && isDefined(groupByFieldXId)
      ? getXSortOptionLabel({
          graphOrderBy: xAxisOrderBy,
          groupByFieldMetadataIdX: groupByFieldXId,
          groupBySubFieldNameX: groupBySubFieldNameX,
          aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
          aggregateOperation: configuration.aggregateOperation ?? undefined,
        })
      : undefined;

  let pieChartSortByLabel: string | undefined;

  if (configuration.__typename === 'PieChartConfiguration') {
    groupByOrderBy = configuration.orderBy;
    groupByFieldYId = configuration.groupByFieldMetadataId;
    groupBySubFieldNameY = configuration.groupBySubFieldName as
      | CompositeFieldSubFieldName
      | undefined;

    pieChartSortByLabel =
      isDefined(configuration.orderBy) &&
      isDefined(configuration.groupByFieldMetadataId)
        ? getXSortOptionLabel({
            graphOrderBy: configuration.orderBy,
            groupByFieldMetadataIdX: configuration.groupByFieldMetadataId,
            groupBySubFieldNameX: configuration.groupBySubFieldName as
              | CompositeFieldSubFieldName
              | undefined,
            aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
            aggregateOperation: configuration.aggregateOperation ?? undefined,
          })
        : undefined;
  }

  const finalGroupByFieldYId = groupByFieldYId;
  const finalGroupBySubFieldNameY = groupBySubFieldNameY;

  const groupByOrderByLabel =
    isDefined(groupByOrderBy) && isDefined(finalGroupByFieldYId)
      ? getGroupBySortOptionLabel({
          graphOrderBy: groupByOrderBy,
          groupByFieldMetadataId: finalGroupByFieldYId,
          groupBySubFieldName: finalGroupBySubFieldNameY,
        })
      : undefined;

  const getChartSettingsValues = (
    itemId: CHART_CONFIGURATION_SETTING_IDS,
  ): boolean | string | undefined => {
    switch (itemId) {
      case CHART_CONFIGURATION_SETTING_IDS.SOURCE:
        return objectMetadataItem?.labelPlural;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X:
        return groupBySubFieldNameXLabel ?? groupByFieldX?.label;
      case CHART_CONFIGURATION_SETTING_IDS.COLORS:
        return hasColorProperty && isDefined(configuration.color)
          ? capitalize(configuration.color)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y:
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_AGGREGATE:
      case CHART_CONFIGURATION_SETTING_IDS.EACH_SLICE_REPRESENTS: {
        if (
          configuration.__typename === 'AggregateChartConfiguration' &&
          isDefined(configuration.ratioAggregateConfig)
        ) {
          const ratioField = objectMetadataItem?.fields.find(
            (field) =>
              field.id === configuration.ratioAggregateConfig?.fieldMetadataId,
          );

          const optionValue = configuration.ratioAggregateConfig.optionValue;
          const getBooleanLabel = (value: string) =>
            value === 'true' ? t`True` : t`False`;

          const ratioOptionLabel =
            ratioField?.options?.find((option) => option.value === optionValue)
              ?.label ??
            (ratioField?.type === 'BOOLEAN'
              ? getBooleanLabel(optionValue)
              : capitalize(optionValue));

          return [aggregateField?.label, `(${t`Ratio`}: ${ratioOptionLabel})`]
            .filter(isDefined)
            .join(' ');
        }

        const operationLabel =
          isDefined(aggregateField?.label) && isDefined(aggregateOperation)
            ? `(${getAggregateOperationLabel(aggregateOperation)})`
            : undefined;

        return [aggregateField?.label, operationLabel]
          .filter(isDefined)
          .join(' ');
      }
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_PIE_CHART: {
        const pieChartGroupByField = isDefined(finalGroupByFieldYId)
          ? objectMetadataItem?.fields.find(
              (field) => field.id === finalGroupByFieldYId,
            )
          : undefined;
        const pieChartGroupBySubFieldNameLabel =
          isDefined(finalGroupBySubFieldNameY) &&
          isDefined(pieChartGroupByField)
            ? getFieldLabelWithSubField({
                field: pieChartGroupByField,
                subFieldName: finalGroupBySubFieldNameY,
                objectMetadataItems,
              })
            : undefined;

        return pieChartGroupBySubFieldNameLabel ?? pieChartGroupByField?.label;
      }

      case CHART_CONFIGURATION_SETTING_IDS.GROUP_BY:
        return groupByFieldY?.label;
      case CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME:
        return isBarOrLineChart && isDefined(configuration.axisNameDisplay)
          ? getChartAxisNameDisplayOptions(configuration.axisNameDisplay)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.PRIMARY_SORT_BY:
        return pieChartSortByLabel ?? xAxisOrderByLabel;
      case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD:
        return groupByOrderByLabel;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS:
        return configuration.displayDataLabel ?? undefined;
      case CHART_CONFIGURATION_SETTING_IDS.FILTER: {
        const filterRulesCount = getChartFilterRulesCount(configuration.filter);
        return filterRulesCount > 0
          ? plural(filterRulesCount, {
              one: `${filterRulesCount} rule`,
              other: `${filterRulesCount} rules`,
            })
          : undefined;
      }
      case CHART_CONFIGURATION_SETTING_IDS.CENTER_METRIC:
        return isPieChart
          ? (configuration.showCenterMetric ?? true)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.STACKED_BARS:
        return configuration.__typename === 'BarChartConfiguration'
          ? configuration.groupMode !== 'GROUPED'
          : true;
      case CHART_CONFIGURATION_SETTING_IDS.STACKED_LINES:
        return configuration.__typename === 'LineChartConfiguration'
          ? configuration.isStacked !== false
          : true;
      case CHART_CONFIGURATION_SETTING_IDS.CUMULATIVE:
        return isBarOrLineChart ? (configuration.isCumulative ?? false) : false;
      case CHART_CONFIGURATION_SETTING_IDS.OMIT_NULL_VALUES:
        return isBarOrLineChart
          ? (configuration.omitNullValues ?? false)
          : false;
      case CHART_CONFIGURATION_SETTING_IDS.HIDE_EMPTY_CATEGORY:
        return isPieChart ? (configuration.hideEmptyCategory ?? false) : false;
      case CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE:
        return isBarOrLineChart
          ? (configuration.rangeMin?.toString() ?? '')
          : '';
      case CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE:
        return isBarOrLineChart
          ? (configuration.rangeMax?.toString() ?? '')
          : '';
      case CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_X:
        return isBarOrLineChart &&
          isDefined(configuration.primaryAxisDateGranularity)
          ? getDateGranularityLabel(configuration.primaryAxisDateGranularity)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_Y:
        return isBarOrLineChart &&
          isDefined(configuration.secondaryAxisGroupByDateGranularity)
          ? getDateGranularityLabel(
              configuration.secondaryAxisGroupByDateGranularity,
            )
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY:
        return isPieChart && isDefined(configuration.dateGranularity)
          ? getDateGranularityLabel(configuration.dateGranularity)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.SHOW_LEGEND:
        return isBarOrLineChart || isPieChart
          ? (configuration.displayLegend ?? true)
          : true;
      case CHART_CONFIGURATION_SETTING_IDS.PREFIX:
        return configuration.__typename === 'AggregateChartConfiguration'
          ? (configuration.prefix ?? '')
          : '';
      case CHART_CONFIGURATION_SETTING_IDS.SUFFIX:
        return configuration.__typename === 'AggregateChartConfiguration'
          ? (configuration.suffix ?? '')
          : '';
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};
