import {
  AllRecordFilterType,
  FilterTypeToOperands,
} from '@/object-record/record-filter/utils/getRecordFilterTypeOperands';

export type RecordFilter<T extends AllRecordFilterType> = {
  id: string;
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  type: T;
  recordFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: FilterTypeToOperands[T];
  positionInRecordFilterGroup?: number | null;
  label: string;
  subFieldName?: string | null | undefined;
};
