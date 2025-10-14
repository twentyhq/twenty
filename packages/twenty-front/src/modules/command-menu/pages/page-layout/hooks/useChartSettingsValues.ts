import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getChartAxisNameDisplayOptions } from '@/command-menu/pages/page-layout/utils/getChartAxisNameDisplayOptions';
import { getFieldLabelWithSubField } from '@/command-menu/pages/page-layout/utils/getFieldLabelWithSubField';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

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

  const groupByFieldX =
    'groupByFieldMetadataIdX' in configuration
      ? objectMetadataItem?.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === configuration.groupByFieldMetadataIdX,
        )
      : undefined;

  const groupBySubFieldNameXLabel =
    'groupBySubFieldNameX' in configuration && isDefined(groupByFieldX)
      ? getFieldLabelWithSubField({
          field: groupByFieldX,
          subFieldName:
            configuration.groupBySubFieldNameX as CompositeFieldSubFieldName,
        })
      : undefined;

  const aggregateField = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.aggregateFieldMetadataId,
  );

  const yAxisAggregateOperation = configuration.aggregateOperation;

  const groupByFieldY =
    'groupByFieldMetadataIdY' in configuration
      ? objectMetadataItem?.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === configuration.groupByFieldMetadataIdY,
        )
      : undefined;

  const xAxisOrderBy =
    'orderByX' in configuration ? configuration.orderByX : undefined;

  const xAxisOrderByLabel =
    isDefined(xAxisOrderBy) && 'groupByFieldMetadataIdX' in configuration
      ? getXSortOptionLabel({
          graphOrderBy: xAxisOrderBy,
          groupByFieldMetadataIdX: configuration.groupByFieldMetadataIdX,
          groupBySubFieldNameX:
            configuration.groupBySubFieldNameX as CompositeFieldSubFieldName,
          aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
          aggregateOperation: configuration.aggregateOperation ?? undefined,
        })
      : undefined;

  const groupByOrderBy =
    'orderByY' in configuration
      ? configuration.orderByY
      : 'orderBy' in configuration
        ? configuration.orderBy
        : undefined;

  const groupByOrderByLabel =
    isDefined(groupByOrderBy) &&
    getGroupBySortOptionLabel({
      graphOrderBy: groupByOrderBy,
      groupByFieldMetadataId:
        'groupByFieldMetadataIdY' in configuration
          ? configuration.groupByFieldMetadataIdY
          : 'groupByFieldMetadataId' in configuration
            ? configuration.groupByFieldMetadataId
            : undefined,
      groupBySubFieldName:
        'groupBySubFieldNameY' in configuration
          ? (configuration.groupBySubFieldNameY as CompositeFieldSubFieldName)
          : 'groupBySubFieldName' in configuration
            ? (configuration.groupBySubFieldName as CompositeFieldSubFieldName)
            : undefined,
    });

  const getChartSettingsValues = (
    itemId: CHART_CONFIGURATION_SETTING_IDS,
  ): boolean | string | undefined => {
    switch (itemId) {
      case CHART_CONFIGURATION_SETTING_IDS.SOURCE:
        return objectMetadataItem?.labelPlural;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X:
        return groupBySubFieldNameXLabel ?? groupByFieldX?.label;
      case CHART_CONFIGURATION_SETTING_IDS.COLORS:
        return 'color' in configuration && isDefined(configuration.color)
          ? capitalize(configuration.color as string)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y: {
        const hasAggregateLabel = isDefined(aggregateField?.label);
        const hasAggregateOperation = isDefined(yAxisAggregateOperation);

        return `${aggregateField?.label ?? ''}${
          hasAggregateLabel && hasAggregateOperation
            ? ` (${getAggregateOperationLabel(yAxisAggregateOperation)})`
            : ''
        }`;
      }
      case CHART_CONFIGURATION_SETTING_IDS.GROUP_BY:
        return groupByFieldY?.label;
      case CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME:
        return 'axisNameDisplay' in configuration &&
          isDefined(configuration.axisNameDisplay)
          ? getChartAxisNameDisplayOptions(configuration.axisNameDisplay)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_X:
        return xAxisOrderByLabel;
      case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD:
        return groupByOrderByLabel;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS:
        return configuration.displayDataLabel ?? undefined;
      case CHART_CONFIGURATION_SETTING_IDS.STACKED_BARS:
        return 'groupMode' in configuration
          ? configuration.groupMode !== 'GROUPED'
          : true;
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};
