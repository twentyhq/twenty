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
        })
      : undefined;

  const aggregateField = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.aggregateFieldMetadataId,
  );

  const yAxisAggregateOperation = configuration.aggregateOperation;

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

  if (configuration.__typename === 'PieChartConfiguration') {
    groupByOrderBy = configuration.orderBy;
    groupByFieldYId = configuration.groupByFieldMetadataId;
    groupBySubFieldNameY = configuration.groupBySubFieldName as
      | CompositeFieldSubFieldName
      | undefined;
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
