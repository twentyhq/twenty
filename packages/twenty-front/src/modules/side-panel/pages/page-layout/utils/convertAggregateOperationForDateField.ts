import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

export const convertAggregateOperationForDateField = (
  configuration: ChartConfiguration,
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
): AggregateOperations | undefined => {
  if (!isDefined(objectMetadataItem)) {
    return undefined;
  }

  const currentAggregateFieldMetadataId =
    configuration.aggregateFieldMetadataId;

  const aggregateField = objectMetadataItem.fields.find(
    (field) => field.id === currentAggregateFieldMetadataId,
  );

  if (
    isDefined(aggregateField) &&
    isFieldMetadataDateKind(aggregateField.type) &&
    (configuration.aggregateOperation === AggregateOperations.MIN ||
      configuration.aggregateOperation === AggregateOperations.MAX)
  ) {
    return AggregateOperations.COUNT;
  }

  return undefined;
};
