import { FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldsAvailableByAggregateOperation';
import { AgreggateOperationsOmittingCount } from '@/object-record/types/AggregateOperationsOmittingCount';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTypeValidForAggregateOperation = (
  fieldType: FieldMetadataType,
  aggregateOperation: AgreggateOperationsOmittingCount,
): boolean => {
  return FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION[aggregateOperation].includes(
    fieldType,
  );
};
