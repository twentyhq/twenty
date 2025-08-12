import { type FilterableAndTSVectorFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { type FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type ViewFilterOperand } from 'twenty-shared/types';

export type RecordFilter = {
  id: string;
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  type: FilterableAndTSVectorFieldType;
  recordFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  positionInRecordFilterGroup?: number | null;
  label: string;
  subFieldName?: CompositeFieldSubFieldName | null | undefined;
};

export type RecordFilterToRecordInputOperand<
  T extends FilterableAndTSVectorFieldType,
> = (typeof FILTER_OPERANDS_MAP)[T][number];
