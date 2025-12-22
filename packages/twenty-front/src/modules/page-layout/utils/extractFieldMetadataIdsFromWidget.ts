import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const extractFieldMetadataIdsFromWidget = (
  widget: PageLayoutWidget,
): string[] => {
  if (widget.type !== WidgetType.GRAPH || !widget.configuration) {
    return [];
  }

  const config = widget.configuration;

  switch (config.__typename) {
    case 'BarChartConfiguration':
      return [
        config.aggregateFieldMetadataId,
        config.primaryAxisGroupByFieldMetadataId,
        config.secondaryAxisGroupByFieldMetadataId,
      ].filter(isDefined);

    case 'LineChartConfiguration':
      return [
        config.aggregateFieldMetadataId,
        config.primaryAxisGroupByFieldMetadataId,
        config.secondaryAxisGroupByFieldMetadataId,
      ].filter(isDefined);

    case 'PieChartConfiguration':
      return [
        config.aggregateFieldMetadataId,
        config.groupByFieldMetadataId,
      ].filter(isDefined);

    case 'AggregateChartConfiguration':
      return [config.aggregateFieldMetadataId].filter(isDefined);

    case 'GaugeChartConfiguration':
      return [config.aggregateFieldMetadataId].filter(isDefined);

    case 'IframeConfiguration':
      return [];

    default:
      return [];
  }
};
