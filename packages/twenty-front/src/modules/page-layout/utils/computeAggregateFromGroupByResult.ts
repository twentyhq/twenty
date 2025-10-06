import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

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

export const computeAggregateFromGroupByResult = ({
  rawResult,
  aggregateField,
  aggregateOperation,
  aggregateOperationFromRawResult,
  objectMetadataItem,
}: ComputeAggregateFromGroupByResultParams) => {
  const transformedData = {
    [aggregateField.name]: {
      [aggregateOperation]: rawResult[aggregateOperationFromRawResult],
    },
  };

  return computeAggregateValueAndLabel({
    data: transformedData,
    objectMetadataItem,
    fieldMetadataId: aggregateField.id,
    aggregateOperation: aggregateOperation,
    dateFormat: DateFormat.DAY_FIRST,
    timeFormat: TimeFormat.HOUR_24,
    timeZone: 'UTC',
    localeCatalog: {},
    formatShortNumberFn: (value: number) => value / 1_000_000,
  });
};
