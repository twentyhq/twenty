import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { removeSortingModalOpenState } from '@/object-record/record-table/states/removeSortingModalOpenState';
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

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(recordTableId);
  const viewSorts = currentViewWithCombinedFiltersAndSorts?.viewSorts || [];

  const setIsRemoveSortingModalOpenState = useSetRecoilState(
    removeSortingModalOpenState,
  );

  const handleDrag: OnDragEndResponder = useRecoilCallback(
    ({ snapshot }) =>
      (result) => {
        if (!result.destination) {
          return;
        }
        if (viewSorts.length > 0) {
          setIsRemoveSortingModalOpenState(true);
          return;
        }

        const draggedRecordId = result.draggableId;
        const destinationIndex = result.destination.index;
        const sourceIndex = result.source.index;

        const recordBeforeId = tableRowIds[destinationIndex - 1];
        const recordAfterId = tableRowIds[destinationIndex];
        const recordAfterAfterId = tableRowIds[destinationIndex + 1];
        const recordBefore = recordBeforeId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordBeforeId))
              .getValue()
          : null;
        const recordAfter = recordAfterId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterId))
              .getValue()
          : null;
        const recordAfterAfter = recordAfterAfterId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterAfterId))
              .getValue()
          : null;

        const computeNewPosition = (destIndex: number, sourceIndex: number) => {
          const moveToFirstPosition = destIndex === 0;
          const moveToLastPosition = destIndex === tableRowIds.length - 1;
          const moveAfterSource = destIndex > sourceIndex;

          const firstRecord = tableRowIds[0]
            ? snapshot
                .getLoadable(recordStoreFamilyState(tableRowIds[0]))
                .getValue()
            : null;

          const lastRecord = tableRowIds[tableRowIds.length - 1]
            ? snapshot
                .getLoadable(
                  recordStoreFamilyState(tableRowIds[tableRowIds.length - 1]),
                )
                .getValue()
            : null;

          if (moveToFirstPosition) {
            return firstRecord?.position / 2;
          } else if (moveToLastPosition) {
            return lastRecord?.position + 1;
          } else if (moveAfterSource) {
            return (recordAfterAfter?.position + recordAfter?.position) / 2;
          } else {
            return (
              recordAfter?.position -
              (recordAfter?.position - recordBefore?.position) / 2
            );
          }
        };

        const newposition = computeNewPosition(destinationIndex, sourceIndex);

        updateOneRow({
          idToUpdate: draggedRecordId,
          updateOneRecordInput: {
            position: newposition,
          },
        });
      },
    [
      tableRowIds,
      updateOneRow,
      viewSorts.length,
      setIsRemoveSortingModalOpenState,
    ],
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
