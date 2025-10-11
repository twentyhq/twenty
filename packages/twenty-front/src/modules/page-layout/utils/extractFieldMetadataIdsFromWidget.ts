import { isDefined } from 'twenty-shared/utils';
import {
  type PageLayoutWidget,
  WidgetType,
} from '~/generated-metadata/graphql';

export const extractFieldMetadataIdsFromWidget = (
  widget: PageLayoutWidget,
): string[] => {
  if (widget.type !== WidgetType.GRAPH || !widget.configuration) {
    return [];
  }

  const config = widget.configuration;

  switch (config.__typename) {
    case 'BarChartConfiguration':
    case 'LineChartConfiguration':
      return [
        config.aggregateFieldMetadataId,
        config.groupByFieldMetadataIdX,
        config.groupByFieldMetadataIdY,
      ].filter(isDefined);

    case 'PieChartConfiguration':
      return [
        config.aggregateFieldMetadataId,
        config.groupByFieldMetadataId,
      ].filter(isDefined);

    case 'NumberChartConfiguration':
      return [config.aggregateFieldMetadataId].filter(isDefined);

    case 'GaugeChartConfiguration':
      return [config.aggregateFieldMetadataId].filter(isDefined);

    case 'IframeConfiguration':
      return [];

    default:
      return [];
  }
};
