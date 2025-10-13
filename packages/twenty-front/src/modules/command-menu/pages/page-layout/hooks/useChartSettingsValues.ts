import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getChartAxisNameDisplayOptions } from '@/command-menu/pages/page-layout/utils/getChartAxisNameDisplayOptions';
import { getChartFieldMappings } from '@/command-menu/pages/page-layout/utils/getChartFieldMappings';
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

  // Get normalized field mappings for BAR and LINE charts
  const fieldMappings =
    configuration.__typename === 'BarChartConfiguration' ||
    configuration.__typename === 'LineChartConfiguration'
      ? getChartFieldMappings(configuration, objectMetadataItem)
      : undefined;

  const groupByFieldX = fieldMappings?.xField;
  const groupByFieldXId = fieldMappings?.xFieldId;
  const groupBySubFieldNameX = fieldMappings?.xSubFieldName as
    | CompositeFieldSubFieldName
    | undefined;

  const groupBySubFieldNameXLabel =
    isDefined(groupBySubFieldNameX) && isDefined(groupByFieldX)
      ? getFieldLabelWithSubField({
          field: groupByFieldX,
          subFieldName: groupBySubFieldNameX,
        })
      : undefined;

  const aggregateField = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.aggregateFieldMetadataId,
  );

  const yAxisAggregateOperation = configuration.aggregateOperation;

  const groupByFieldY = fieldMappings?.yField;
  const groupByFieldYId = fieldMappings?.yFieldId;
  const groupBySubFieldNameY = fieldMappings?.ySubFieldName as
    | CompositeFieldSubFieldName
    | undefined;

  const xAxisOrderBy = fieldMappings?.xOrderBy;

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

  const groupByOrderBy =
    configuration.__typename === 'PieChartConfiguration'
      ? configuration.orderBy
      : fieldMappings?.yOrderBy;

  const groupByOrderByLabel =
    isDefined(groupByOrderBy) &&
    getGroupBySortOptionLabel({
      graphOrderBy: groupByOrderBy,
      groupByFieldMetadataId:
        configuration.__typename === 'PieChartConfiguration'
          ? configuration.groupByFieldMetadataId
          : groupByFieldYId,
      groupBySubFieldName:
        configuration.__typename === 'PieChartConfiguration'
          ? (configuration.groupBySubFieldName as
              | CompositeFieldSubFieldName
              | undefined)
          : groupBySubFieldNameY,
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
          ? capitalize(configuration.color)
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
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};
