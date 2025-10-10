import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutWidget } from '~/generated/graphql';

const fieldExists = (
  fieldId: string | undefined | null,
  objectMetadataItem: ObjectMetadataItem,
): boolean => {
  if (!isDefined(fieldId)) {
    return false;
  }

  return objectMetadataItem.fields.some((field) => field.id === fieldId);
};

export const areChartConfigurationFieldsValidForQuery = (
  configuration: PageLayoutWidget['configuration'],
  objectMetadataItem?: ObjectMetadataItem | null,
): boolean => {
  if (!isDefined(configuration)) {
    return false;
  }

  if (!isDefined(objectMetadataItem) || !isDefined(objectMetadataItem.fields)) {
    return false;
  }

  switch (configuration.__typename) {
    case 'BarChartConfiguration':
    case 'LineChartConfiguration': {
      const hasRequiredXFields =
        fieldExists(
          configuration.aggregateFieldMetadataId,
          objectMetadataItem,
        ) &&
        fieldExists(configuration.groupByFieldMetadataIdX, objectMetadataItem);

      const hasValidYField =
        !isDefined(configuration.groupByFieldMetadataIdY) ||
        fieldExists(configuration.groupByFieldMetadataIdY, objectMetadataItem);

      return hasRequiredXFields && hasValidYField;
    }

    case 'PieChartConfiguration':
      return (
        fieldExists(
          configuration.aggregateFieldMetadataId,
          objectMetadataItem,
        ) &&
        fieldExists(configuration.groupByFieldMetadataId, objectMetadataItem)
      );

    case 'NumberChartConfiguration':
    case 'GaugeChartConfiguration':
      return fieldExists(
        configuration.aggregateFieldMetadataId,
        objectMetadataItem,
      );

    case 'IframeConfiguration':
      return (
        typeof configuration.url === 'string' &&
        configuration.url.trim().length > 0
      );

    default:
      return false;
  }
};
