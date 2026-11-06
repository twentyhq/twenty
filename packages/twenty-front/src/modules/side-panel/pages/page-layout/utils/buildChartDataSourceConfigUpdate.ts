import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getChartDefaultFieldSelection } from '@/page-layout/utils/getChartDefaultFieldSelection';
import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { buildChartGroupByFieldConfigUpdate } from '@/side-panel/pages/page-layout/utils/buildChartGroupByFieldConfigUpdate';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';

export const buildChartDataSourceConfigUpdate = ({
  configuration,
  objectMetadataItem,
  objectMetadataItems,
}: {
  configuration: ChartConfiguration;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => {
  const {
    aggregateFieldMetadataId,
    aggregateOperation,
    groupByFieldMetadataId,
  } = getChartDefaultFieldSelection(objectMetadataItem);

  const aggregateConfigUpdate = {
    aggregateFieldMetadataId,
    aggregateOperation,
    filter: {},
  };

  if (
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration')
  ) {
    return { ...aggregateConfigUpdate, ratioAggregateConfig: undefined };
  }

  if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return {
      ...aggregateConfigUpdate,
      ...buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey: 'groupByFieldMetadataId',
        subFieldNameKey: 'groupBySubFieldName',
        fieldId: groupByFieldMetadataId ?? null,
        subFieldName: null,
        objectMetadataItem,
        objectMetadataItems,
      }),
    };
  }

  return {
    ...aggregateConfigUpdate,
    ...buildChartGroupByFieldConfigUpdate({
      configuration,
      fieldMetadataIdKey: 'secondaryAxisGroupByFieldMetadataId',
      subFieldNameKey: 'secondaryAxisGroupBySubFieldName',
      fieldId: null,
      subFieldName: null,
      objectMetadataItem,
      objectMetadataItems,
    }),
    ...buildChartGroupByFieldConfigUpdate({
      configuration,
      fieldMetadataIdKey: 'primaryAxisGroupByFieldMetadataId',
      subFieldNameKey: 'primaryAxisGroupBySubFieldName',
      fieldId: groupByFieldMetadataId ?? null,
      subFieldName: null,
      objectMetadataItem,
      objectMetadataItems,
    }),
  };
};
