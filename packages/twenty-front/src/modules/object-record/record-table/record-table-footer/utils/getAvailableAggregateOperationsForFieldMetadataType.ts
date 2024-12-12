import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldsAvailableByAggregateOperation';
import { AggregateOperationsOmittingCount } from '@/object-record/types/AggregateOperationsOmittingCount';
import { isFieldTypeValidForAggregateOperation } from '@/object-record/utils/isFieldTypeValidForAggregateOperation';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const getAvailableAggregateOperationsForFieldMetadataType = ({
  fieldMetadataType,
}: {
  fieldMetadataType?: FieldMetadataType;
}) => {
  const availableAggregateOperations = new Set<AGGREGATE_OPERATIONS>([
    AGGREGATE_OPERATIONS.count,
  ]);

  if (!isDefined(fieldMetadataType)) {
    return Array.from(availableAggregateOperations);
  }

  Object.keys(FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION)
    .filter((operation) =>
      isFieldTypeValidForAggregateOperation(
        fieldMetadataType,
        operation as AggregateOperationsOmittingCount,
      ),
    )
    .forEach((operation) =>
      availableAggregateOperations.add(operation as AGGREGATE_OPERATIONS),
    );

  return Array.from(availableAggregateOperations);
};
