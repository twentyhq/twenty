import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
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
> = {
  id: string;
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  type: T;
  recordFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: RecordFilterOperands<T>;
  positionInRecordFilterGroup?: number | null;
  label: string;
  subFieldName?: string | null | undefined;
};
