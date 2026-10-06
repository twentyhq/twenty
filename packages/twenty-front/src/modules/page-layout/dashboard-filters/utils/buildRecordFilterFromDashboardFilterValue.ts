import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import {
  getDashboardFilterRecordFilterId,
  getFilterTypeFromFieldType,
} from 'twenty-shared/utils';

// The display value is left empty on purpose: the chip derives it from the value at render time.
export const buildRecordFilterFromDashboardFilterValue = ({
  slot,
  binding,
  fieldMetadataItem,
  value,
}: {
  slot: DashboardFilterSlot;
  binding: DashboardFilterBinding;
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'type'>;
  value: DashboardFilterValue;
}): RecordFilter => ({
  id: getDashboardFilterRecordFilterId(slot.id),
  fieldMetadataId: fieldMetadataItem.id,
  label: slot.label,
  type: getFilterTypeFromFieldType(fieldMetadataItem.type),
  operand: value.operand,
  value: value.value,
  displayValue: '',
  subFieldName: binding.subFieldName,
  relationTargetFieldMetadataId: binding.relationTargetFieldMetadataId,
});
