import { useState } from 'react';
import styled from '@emotion/styled';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordTablePendingRow } from '@/object-record/record-table/components/RecordTablePendingRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useComputeNewRowPosition } from '@/object-record/record-table/hooks/useComputeNewRowPosition';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from '~/utils/isDefined';

type DraggableTableBodyProps = {
  draggableItems: React.ReactNode;
  objectNameSingular: string;
  recordTableId: string;
};

const StyledTbody = styled.tbody`
  overflow: hidden;
`;

export const DraggableTableBody = ({
  objectNameSingular,
  draggableItems,
  recordTableId,
}: DraggableTableBodyProps) => {
  const [v4Persistable] = useState(v4());

  const { tableRowIdsState } = useRecordTableStates();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(recordTableId);

  const viewSorts = currentViewWithCombinedFiltersAndSorts?.viewSorts || [];

  const setIsRemoveSortingModalOpenState = useSetRecoilState(
    isRemoveSortingModalOpenState,
  );
  const computeNewRowPosition = useComputeNewRowPosition();

  const handleDragEnd = (result: DropResult) => {
    if (viewSorts.length > 0) {
      setIsRemoveSortingModalOpenState(true);
      return;
    }

    const computeResult = computeNewRowPosition(result, tableRowIds);

    if (!isDefined(computeResult)) {
      return;
    }

    updateOneRow({
      idToUpdate: computeResult.draggedRecordId,
      updateOneRecordInput: {
        position: computeResult.newPosition,
      },
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={v4Persistable}>
        {(provided) => (
          <StyledTbody
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            <RecordTablePendingRow />
            {draggableItems}
            {provided.placeholder}
          </StyledTbody>
        )}
      </Droppable>
    </DragDropContext>
  );
};
