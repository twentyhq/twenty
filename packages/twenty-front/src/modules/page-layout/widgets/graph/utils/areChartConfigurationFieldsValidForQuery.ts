import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutWidget } from '~/generated/graphql';

type ChartConfigurationFieldsValidForQueryResult = {
  isValid: boolean;
};

const fieldExists = (
  fieldId: string | undefined | null,
  objectMetadataItem: ObjectMetadataItem,
): boolean => {
  if (!isDefined(fieldId)) return false;
  return objectMetadataItem.fields.some((field) => field.id === fieldId);
};

export const areChartConfigurationFieldsValidForQuery = (
  configuration: PageLayoutWidget['configuration'],
  objectMetadataItem: ObjectMetadataItem,
): ChartConfigurationFieldsValidForQueryResult => {
  if (!isDefined(configuration)) {
    return { isValid: false };
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

      const hasValidYField =
        !isDefined(configuration.groupByFieldMetadataIdY) ||
        fieldExists(configuration.groupByFieldMetadataIdY, objectMetadataItem);

      return { isValid: hasValidFields && hasValidYField };
    }

    case 'PieChartConfiguration': {
      const hasValidFields =
        fieldExists(
          configuration.aggregateFieldMetadataId,
          objectMetadataItem,
        ) &&
        fieldExists(configuration.groupByFieldMetadataId, objectMetadataItem);

      return { isValid: hasValidFields };
    }

    case 'NumberChartConfiguration':
    case 'GaugeChartConfiguration': {
      const hasValidField = fieldExists(
        configuration.aggregateFieldMetadataId,
        objectMetadataItem,
      );

      return { isValid: hasValidField };
    }

    case 'IframeConfiguration': {
      const hasValidUrl =
        typeof configuration.url === 'string' &&
        configuration.url.trim().length > 0;

      return { isValid: hasValidUrl };
    }

    default:
      return { isValid: false };
  }
};
