import { useGraphSortOptions } from '@/command-menu/pages/page-layout/hooks/useGraphSortOptions';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getChartAxisNameDisplayOptions } from '@/command-menu/pages/page-layout/utils/getChartAxisNameDisplayOptions';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared/utils';

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

  const graphSortOptions = useGraphSortOptions({
    objectMetadataId,
    configuration,
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

  const xAxisOrderByLabel = graphSortOptions.sortOptions.find(
    (option) => option.value === xAxisOrderBy,
  )?.label;

  const getChartSettingsValues = (
    itemId: CHART_CONFIGURATION_SETTING_IDS,
  ): boolean | string | undefined => {
    switch (itemId) {
      case CHART_CONFIGURATION_SETTING_IDS.SOURCE:
        return objectMetadataItem?.labelPlural;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X:
        return groupByFieldX?.label;
      case CHART_CONFIGURATION_SETTING_IDS.COLORS:
        return 'color' in configuration
          ? capitalize(configuration.color ?? '')
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y:
        return `${aggregateField?.label ?? ''}${aggregateField?.label ? ` (${getAggregateOperationLabel(yAxisAggregateOperation)})` : ''}`;
      case CHART_CONFIGURATION_SETTING_IDS.GROUP_BY_Y:
        return groupByFieldY?.label;
      case CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME:
        return 'axisNameDisplay' in configuration
          ? getChartAxisNameDisplayOptions(configuration.axisNameDisplay)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_X:
        return xAxisOrderByLabel;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS:
        return configuration.displayDataLabel;
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};
