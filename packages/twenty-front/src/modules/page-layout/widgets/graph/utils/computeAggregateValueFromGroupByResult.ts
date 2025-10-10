import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { computeAggregateNumericValueForGraph } from '@/page-layout/widgets/graph/utils/computeAggregateNumericValueForGraph';

type GroupByRawResult = {
  groupByDimensionValues: unknown[];
  [key: string]: unknown;
};

type ComputeAggregateFromGroupByResultParams = {
  rawResult: GroupByRawResult;
  aggregateField: FieldMetadataItem;
  aggregateOperation: ExtendedAggregateOperations;
  aggregateOperationFromRawResult: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const computeAggregateValueFromGroupByResult = ({
  rawResult,
  aggregateField,
  aggregateOperation,
  aggregateOperationFromRawResult,
  objectMetadataItem,
}: ComputeAggregateFromGroupByResultParams): number => {
  const transformedData = {
    [aggregateField.name]: {
      [aggregateOperation]: rawResult[aggregateOperationFromRawResult],
    },
  };

  return computeAggregateNumericValueForGraph({
    data: transformedData,
    objectMetadataItem,
    fieldMetadataId: aggregateField.id,
    aggregateOperation: aggregateOperation,
  });
};
