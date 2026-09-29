import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { TOGGLE_MINE_RECORD_FILTER_ID } from '@/views/constants/ToggleMineRecordFilterId';
import { type RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';

export const buildToggleMineRecordFilter = (
  toggleMineFilterFieldMetadataItem: FieldMetadataItem,
): RecordFilter => ({
  id: TOGGLE_MINE_RECORD_FILTER_ID,
  fieldMetadataId: toggleMineFilterFieldMetadataItem.id,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: true,
    selectedRecordIds: [],
  } satisfies RelationFilterValue),
  displayValue: 'Me',
  type: getFilterTypeFromFieldType(toggleMineFilterFieldMetadataItem.type),
  operand: ViewFilterOperand.IS,
  label: toggleMineFilterFieldMetadataItem.label,
  subFieldName:
    toggleMineFilterFieldMetadataItem.type === FieldMetadataType.ACTOR
      ? 'workspaceMemberId'
      : undefined,
});
