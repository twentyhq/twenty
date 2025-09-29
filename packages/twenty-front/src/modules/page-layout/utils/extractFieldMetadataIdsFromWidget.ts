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
  const fieldIds: string[] = [];

  switch (config.__typename) {
    case 'BarChartConfiguration':
    case 'LineChartConfiguration':
      fieldIds.push(config.aggregateFieldMetadataId);
      fieldIds.push(config.groupByFieldMetadataIdX);
      if (isDefined(config.groupByFieldMetadataIdY)) {
        fieldIds.push(config.groupByFieldMetadataIdY);
      }
      break;

    case 'PieChartConfiguration':
      fieldIds.push(config.aggregateFieldMetadataId);
      fieldIds.push(config.groupByFieldMetadataId);
      break;

    case 'NumberChartConfiguration':
      fieldIds.push(config.aggregateFieldMetadataId);
      break;

    case 'GaugeChartConfiguration':
      fieldIds.push(config.aggregateFieldMetadataId);
      fieldIds.push(config.aggregateFieldMetadataIdTotal);
      break;

    case 'IframeConfiguration':
      break;
  }

  return fieldIds;
};
