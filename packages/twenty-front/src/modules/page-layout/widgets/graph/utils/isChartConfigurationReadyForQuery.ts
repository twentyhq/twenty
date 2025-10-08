import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutWidget } from '~/generated/graphql';

type ChartConfigurationReadyForQueryResult = {
  isReady: boolean;
};

const fieldExists = (
  fieldId: string | undefined | null,
  objectMetadataItem: ObjectMetadataItem,
): boolean => {
  if (!isDefined(fieldId)) return false;
  return objectMetadataItem.fields.some((field) => field.id === fieldId);
};

export const isChartConfigurationReadyForQuery = (
  configuration: PageLayoutWidget['configuration'],
  objectMetadataItem: ObjectMetadataItem,
): ChartConfigurationReadyForQueryResult => {
  if (!isDefined(configuration)) {
    return { isReady: false };
  }

  switch (configuration.__typename) {
    case 'BarChartConfiguration':
    case 'LineChartConfiguration': {
      const hasValidFields =
        fieldExists(
          configuration.aggregateFieldMetadataId,
          objectMetadataItem,
        ) &&
        fieldExists(configuration.groupByFieldMetadataIdX, objectMetadataItem);

      const hasValidYField = isDefined(configuration.groupByFieldMetadataIdY)
        ? fieldExists(configuration.groupByFieldMetadataIdY, objectMetadataItem)
        : true;

      return { isReady: hasValidFields && hasValidYField };
    }

    case 'PieChartConfiguration': {
      const hasValidFields =
        fieldExists(
          configuration.aggregateFieldMetadataId,
          objectMetadataItem,
        ) &&
        fieldExists(configuration.groupByFieldMetadataId, objectMetadataItem);

      return { isReady: hasValidFields };
    }

    case 'NumberChartConfiguration':
    case 'GaugeChartConfiguration': {
      const hasValidField = fieldExists(
        configuration.aggregateFieldMetadataId,
        objectMetadataItem,
      );

      return { isReady: hasValidField };
    }

    case 'IframeConfiguration': {
      return { isReady: isDefined(configuration.url) };
    }

    default:
      return { isReady: false };
  }
};
