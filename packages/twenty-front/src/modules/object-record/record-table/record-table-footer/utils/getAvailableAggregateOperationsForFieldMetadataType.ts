import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldTypesAvailableForNonStandardAggregateOperation';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type AggregateOperationsOmittingStandardOperations } from '@/object-record/types/AggregateOperationsOmittingStandardOperations';
import { isFieldTypeValidForAggregateOperation } from '@/object-record/utils/isFieldTypeValidForAggregateOperation';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getAvailableAggregateOperationsForFieldMetadataType = ({
  fieldMetadataType,
}: {
  fieldMetadataType?: FieldMetadataType;
}) => {
  if (fieldMetadataType === FieldMetadataType.RELATION) {
    return [AggregateOperations.COUNT];
  }

  const availableAggregateOperations = new Set<ExtendedAggregateOperations>([
    AggregateOperations.COUNT,
    AggregateOperations.COUNT_EMPTY,
    AggregateOperations.COUNT_NOT_EMPTY,
    AggregateOperations.COUNT_UNIQUE_VALUES,
    AggregateOperations.PERCENTAGE_EMPTY,
    AggregateOperations.PERCENTAGE_NOT_EMPTY,
  ]);

  if (!isDefined(fieldMetadataType)) {
    return Array.from(availableAggregateOperations);
  }

  Object.keys(FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION)
    .filter((operation) =>
      isFieldTypeValidForAggregateOperation(
        fieldMetadataType,
        operation as AggregateOperationsOmittingStandardOperations,
      ),
    )
    .forEach((operation) =>
      availableAggregateOperations.add(
        operation as ExtendedAggregateOperations,
      ),
    );

  return Array.from(availableAggregateOperations);
};
