import { useRecoilValue, useSetRecoilState } from 'recoil';

import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useTableRowDragHandler } from '@/object-record/record-table/hooks/useTableRowDragHandler';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { DraggableTableBody } from '@/ui/layout/draggable-list/components/DraggableTableBody';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';

type RecordTableBodyProps = {
  objectNameSingular: string;
  recordTableId: string;
};

export const RecordTableBody = ({
  objectNameSingular,
  recordTableId,
}: RecordTableBodyProps) => {
  const { tableRowIdsState } = useRecordTableStates();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(recordTableId);
  const viewSorts = currentViewWithCombinedFiltersAndSorts?.viewSorts || [];

  const setIsRemoveSortingModalOpenState = useSetRecoilState(
    isRemoveSortingModalOpenState,
  );

  const handleDrag = useTableRowDragHandler(
    objectNameSingular,
    viewSorts,
    setIsRemoveSortingModalOpenState,
  );

  return (
    <>
      <DraggableTableBody
        onDragEnd={handleDrag}
        draggableItems={
          <>
            {tableRowIds.map((recordId, rowIndex) => {
              return (
                <RecordTableRow
                  key={recordId}
                  recordId={recordId}
                  rowIndex={rowIndex}
                />
              );
            })}
          </>
        }
      />
      <RecordTableBodyFetchMoreLoader objectNameSingular={objectNameSingular} />
    </>
  );
};
