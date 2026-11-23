import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export type RecordFieldSummary = {
  aggregateOperation: ExtendedAggregateOperations;
  aggregatedFieldMetadataItem?: FieldMetadataItem;
  aggregateGqlFieldName: string;
};
