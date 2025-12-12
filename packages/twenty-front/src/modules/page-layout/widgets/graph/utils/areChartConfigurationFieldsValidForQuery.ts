import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type RatioAggregateConfig } from '~/generated/graphql';

const fieldExists = (
  fieldId: string | undefined | null,
  objectMetadataItem: ObjectMetadataItem,
): boolean => {
  if (!isDefined(fieldId)) {
    return false;
  }

  return objectMetadataItem.fields.some((field) => field.id === fieldId);
};

const isRatioConfigValid = (
  ratioConfig: RatioAggregateConfig | null | undefined,
  objectMetadataItem: ObjectMetadataItem,
): boolean => {
  if (!isDefined(ratioConfig)) {
    return true;
  }

  const field = objectMetadataItem.fields.find(
    (f) => f.id === ratioConfig.fieldMetadataId,
  );

  if (!isDefined(field)) {
    return false;
  }

  if (field.type === FieldMetadataType.BOOLEAN) {
    return (
      ratioConfig.optionValue === 'true' || ratioConfig.optionValue === 'false'
    );
  }

  if (
    field.type === FieldMetadataType.SELECT ||
    field.type === FieldMetadataType.MULTI_SELECT
  ) {
    const options = field.options ?? [];
    return options.some((option) => option.value === ratioConfig.optionValue);
  }

  return false;
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
    case 'LineChartConfiguration':
      return (
        fieldExists(
          configuration.aggregateFieldMetadataId,
          objectMetadataItem,
        ) &&
        fieldExists(
          configuration.primaryAxisGroupByFieldMetadataId,
          objectMetadataItem,
        ) &&
        (!isDefined(configuration.secondaryAxisGroupByFieldMetadataId) ||
          fieldExists(
            configuration.secondaryAxisGroupByFieldMetadataId,
            objectMetadataItem,
          ))
      );

    case 'PieChartConfiguration':
      return (
        fieldExists(
          configuration.aggregateFieldMetadataId,
          objectMetadataItem,
        ) &&
        fieldExists(configuration.groupByFieldMetadataId, objectMetadataItem)
      );

    case 'AggregateChartConfiguration':
      return (
        fieldExists(
          configuration.aggregateFieldMetadataId,
          objectMetadataItem,
        ) &&
        isRatioConfigValid(
          configuration.ratioAggregateConfig,
          objectMetadataItem,
        )
      );

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
