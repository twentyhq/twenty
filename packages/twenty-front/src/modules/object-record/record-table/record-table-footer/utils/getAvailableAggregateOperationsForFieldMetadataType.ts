import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldTypesAvailableForNonStandardAggregateOperation';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { AggregateOperationsOmittingStandardOperations } from '@/object-record/types/AggregateOperationsOmittingStandardOperations';
import { isFieldTypeValidForAggregateOperation } from '@/object-record/utils/isFieldTypeValidForAggregateOperation';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated/graphql';

export const getAvailableAggregateOperationsForFieldMetadataType = ({
  fieldMetadataType,
}: {
  fieldMetadataType?: FieldMetadataType;
}) => {
  if (fieldMetadataType === FieldMetadataType.RELATION) {
    return [AggregateOperations.count];
  }

  const availableAggregateOperations = new Set<ExtendedAggregateOperations>([
    AggregateOperations.count,
    AggregateOperations.countEmpty,
    AggregateOperations.countNotEmpty,
    AggregateOperations.countUniqueValues,
    AggregateOperations.percentageEmpty,
    AggregateOperations.percentageNotEmpty,
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
