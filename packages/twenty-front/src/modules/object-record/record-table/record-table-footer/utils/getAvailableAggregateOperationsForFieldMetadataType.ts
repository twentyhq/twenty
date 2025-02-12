import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldTypesAvailableForNonStandardAggregateOperation';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { AggregateOperationsOmittingStandardOperations } from '@/object-record/types/AggregateOperationsOmittingStandardOperations';
import { isFieldTypeValidForAggregateOperation } from '@/object-record/utils/isFieldTypeValidForAggregateOperation';
import { isDefined } from 'twenty-shared';
import { FieldMetadataType } from '~/generated/graphql';

export const getAvailableAggregateOperationsForFieldMetadataType = ({
  fieldMetadataType,
}: {
  fieldMetadataType?: FieldMetadataType;
}) => {
  if (fieldMetadataType === FieldMetadataType.RELATION) {
    return [AGGREGATE_OPERATIONS.count];
  }

  const availableAggregateOperations = new Set<ExtendedAggregateOperations>([
    AGGREGATE_OPERATIONS.count,
    AGGREGATE_OPERATIONS.countEmpty,
    AGGREGATE_OPERATIONS.countNotEmpty,
    AGGREGATE_OPERATIONS.countUniqueValues,
    AGGREGATE_OPERATIONS.percentageEmpty,
    AGGREGATE_OPERATIONS.percentageNotEmpty,
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
