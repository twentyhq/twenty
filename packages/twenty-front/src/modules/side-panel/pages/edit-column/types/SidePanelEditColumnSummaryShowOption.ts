import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type IconComponent } from 'twenty-ui/icon';

export type SidePanelEditColumnSummaryShowOption = {
  aggregateOperation: AggregateOperations;
  relationTargetFieldMetadataId: string | null;
  Icon?: IconComponent;
  label: string;
  operationLabel: string;
  value: string;
};
