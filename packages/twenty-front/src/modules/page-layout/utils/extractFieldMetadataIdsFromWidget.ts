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
        ...(isDefined(config.groupByFieldMetadataIdY)
          ? [config.groupByFieldMetadataIdY]
          : []),
      ];

    case 'PieChartConfiguration':
      return [config.aggregateFieldMetadataId, config.groupByFieldMetadataId];

    case 'NumberChartConfiguration':
      return [config.aggregateFieldMetadataId];

    case 'GaugeChartConfiguration':
      return [config.aggregateFieldMetadataId];

    case 'IframeConfiguration':
      return [];

    default:
      return [];
  }
};
