import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export type RecordFilter = {
  id: string;
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  type: FilterableFieldType;
  recordFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  positionInRecordFilterGroup?: number | null;
  label: string;
  subFieldName?: string | null | undefined;
};

export type RecordFilterInput<
  T extends FilterableFieldType = FilterableFieldType,
> = Pick<RecordFilter, 'value'> & {
  type: T;
  operand: (typeof FILTER_OPERANDS_MAP)[T][number];
};
