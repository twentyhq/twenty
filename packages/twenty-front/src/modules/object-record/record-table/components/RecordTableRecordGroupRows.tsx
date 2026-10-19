import { RecordDragEndDropZone } from '@/object-record/record-drag/components/RecordDragEndDropZone';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { RecordTableRecordGroupSectionAddNew } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionAddNew';
import { RecordTableRecordGroupSectionLoadMore } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionLoadMore';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

export const RecordTableRecordGroupRows = () => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const shouldHide = useShouldHideRecordGroup(currentRecordGroupId);

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  const isRecordGroupTableSectionToggled = useAtomComponentFamilyStateValue(
    isRecordGroupTableSectionToggledComponentState,
    currentRecordGroupId,
  );

  if (shouldHide) {
    return null;
  }

  if (!isRecordGroupTableSectionToggled) {
    return null;
  }

  return (
    <>
      {recordIndexRecordIdsByGroup.map((recordId, rowIndexInGroup) => (
        <RecordTableRow
          key={recordId}
          recordId={recordId}
          rowIndexForDrag={rowIndexInGroup}
        />
      ))}
      <RecordDragEndDropZone
        droppableId={currentRecordGroupId}
        dndType={RECORD_TABLE_ROW_DND_TYPE}
        index={recordIndexRecordIdsByGroup.length}
      >
        <RecordTableRecordGroupSectionLoadMore />
        <RecordTableRecordGroupSectionAddNew />
      </RecordDragEndDropZone>
      <RecordTableAggregateFooter
        key={currentRecordGroupId}
        currentRecordGroupId={currentRecordGroupId}
      />
    </>
  );
};
