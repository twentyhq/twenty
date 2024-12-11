import { AGGREGATE_OPERATIONS } from "@/object-record/record-table/constants/AggregateOperations";
import { FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION } from "@/object-record/record-table/constants/FieldsAvailableByAggregateOperation";
import { AggregateOperationsOmittingCount } from "@/object-record/types/AggregateOperationsOmittingCount";
import { isFieldTypeValidForAggregateOperation } from "@/object-record/utils/isFieldTypeValidForAggregateOperation";
import { FieldMetadataType } from "~/generated/graphql";
import { isDefined } from "~/utils/isDefined";

export const getAvailableAggregateOperationsForFieldMetadataType = ({fieldMetadataType}: {fieldMetadataType?: FieldMetadataType}) => {
    let availableAggregateOperations: AGGREGATE_OPERATIONS[] = [AGGREGATE_OPERATIONS.count];
    
    if (!isDefined(fieldMetadataType)) {
        return availableAggregateOperations;
    }
    Object.keys(FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION).forEach(
        (aggregateOperation) => {
          const typedAggregateOperation =
            aggregateOperation as AggregateOperationsOmittingCount;
  
          if (
            isFieldTypeValidForAggregateOperation(
              fieldMetadataType,
              typedAggregateOperation,
            )
          ) {
            availableAggregateOperations.push(typedAggregateOperation);
          }
        },
      );
      return availableAggregateOperations;
};
