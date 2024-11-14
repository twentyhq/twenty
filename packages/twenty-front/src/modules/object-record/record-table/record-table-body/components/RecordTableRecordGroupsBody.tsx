import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { RecordTableRecordGroupRows } from '@/object-record/record-table/components/RecordTableRecordGroupRows';
import { RecordTableBodyDragDropContext } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDragDropContext';
import { RecordTableBodyDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppable';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTablePendingRow } from '@/object-record/record-table/record-table-row/components/RecordTablePendingRow';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { tableAllRowIdsComponentState } from '@/object-record/record-table/states/tableAllRowIdsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

type RecordTableRecordGroupsBodyProps = {
  objectNameSingular: string;
};

export const RecordTableRecordGroupsBody = ({
  objectNameSingular,
}: RecordTableRecordGroupsBodyProps) => {
  const tableAllRowIds = useRecoilComponentValueV2(
    tableAllRowIdsComponentState,
  );

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
  );

  const { visibleRecordGroups } = useRecordGroups({ objectNameSingular });

  if (isRecordTableInitialLoading && tableAllRowIds.length === 0) {
    return <RecordTableBodyLoading />;
  }

  return (
    <RecordTableBodyDragDropContext>
      <RecordTableBodyDroppable>
        <RecordTablePendingRow />
        {visibleRecordGroups.map((recordGroupDefinition) => (
          <RecordGroupContext.Provider
            value={{ recordGroupId: recordGroupDefinition.id }}
          >
            <RecordTableRecordGroupRows />
          </RecordGroupContext.Provider>
        ))}
      </RecordTableBodyDroppable>
    </RecordTableBodyDragDropContext>
  );
};
