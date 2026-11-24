import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export type SidePanelEditColumnSummaryShowOption = {
  aggregateOperation: AggregateOperations;
  relationTargetFieldMetadataId: string | null;
  label: string;
  operationLabel: string;
  value: string;
};
