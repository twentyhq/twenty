import { RecordDragEndDropZone } from '@/object-record/record-drag/components/RecordDragEndDropZone';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableNoRecordGroupAddNew } from '@/object-record/record-table/components/RecordTableNoRecordGroupAddNew';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableNoRecordGroupAddNewDropZone = () => {
  const totalNumberOfRows =
    useAtomComponentStateValue(totalNumberOfRowsComponentState) ?? 0;

  return (
    <RecordDragEndDropZone
      droppableId={NO_RECORD_GROUP_FAMILY_KEY}
      dndType={RECORD_TABLE_ROW_DND_TYPE}
      index={totalNumberOfRows}
    >
      <RecordTableNoRecordGroupAddNew />
    </RecordDragEndDropZone>
  );
};
