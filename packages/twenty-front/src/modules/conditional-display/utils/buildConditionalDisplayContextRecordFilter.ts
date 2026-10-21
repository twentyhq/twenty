import { getConditionalDisplayContextRecordFilterType } from '@/conditional-display/utils/getConditionalDisplayContextRecordFilterType';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  type ConditionalDisplayContextKey,
  ViewFilterOperand,
} from 'twenty-shared/types';

export const buildConditionalDisplayContextRecordFilter = ({
  id,
  contextKey,
  recordFilterGroupId,
  positionInRecordFilterGroup,
}: {
  id: string;
  contextKey: ConditionalDisplayContextKey;
  recordFilterGroupId?: string;
  positionInRecordFilterGroup?: number | null;
}): RecordFilter => ({
  id,
  fieldMetadataId: '',
  contextKey,
  type: getConditionalDisplayContextRecordFilterType(contextKey),
  operand: ViewFilterOperand.IS,
  value: '',
  displayValue: '',
  label: '',
  recordFilterGroupId,
  positionInRecordFilterGroup,
  subFieldName: null,
  relationTargetFieldMetadataId: null,
});
