import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export type RecordFilter = {
  id: string;
  variant?: 'default' | 'danger';
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  viewFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  positionInViewFilterGroup?: number | null;
  definition: RecordFilterDefinition;
};
