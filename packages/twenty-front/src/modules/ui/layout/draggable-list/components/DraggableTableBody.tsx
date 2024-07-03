import { useState } from 'react';
import styled from '@emotion/styled';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';
import { v4 } from 'uuid';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordTablePendingRow } from '@/object-record/record-table/components/RecordTablePendingRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useComputeNewRowPosition } from '@/object-record/record-table/hooks/useComputeNewRowPosition';
import { isRecordTableScrolledLeftState } from '@/object-record/record-table/states/isRecordTableScrolledLeftState';
import { isRecordTableScrolledTopState } from '@/object-record/record-table/states/isRecordTableScrolledTopState';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from '~/utils/isDefined';

type DraggableTableBodyProps = {
  draggableItems: React.ReactNode;
  objectNameSingular: string;
  recordTableId: string;
};

const StyledTbody = styled.tbody<{ freezeFirstColumns?: boolean }>`
  overflow: hidden;

  td {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.primary};
    border-right: 1px solid ${({ theme }) => theme.border.color.light};

    padding: 0;

    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-top-color: transparent;
      border-bottom-color: transparent;
    }
  }

  td:nth-of-type(1),
  td:nth-of-type(2),
  td:nth-of-type(3) {
    position: sticky;
    z-index: 1;
  }

  td:nth-of-type(1) {
    left: 0;
    z-index: 7;
  }

  td:nth-of-type(2) {
    left: 9px;
    z-index: 5;
  }

  td:nth-of-type(3) {
    left: 39px;
    z-index: 6;

    ${({ freezeFirstColumns }) =>
      freezeFirstColumns
        ? `@media (max-width: ${MOBILE_VIEWPORT}px) {
      width: 35px;
      max-width: 35px;
    }`
        : ''}
  }
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

  const isRecordTableScrolledTop = useRecoilValue(
    isRecordTableScrolledTopState,
  );

  const isRecordTableScrolledLeft = useRecoilValue(
    isRecordTableScrolledLeftState,
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={v4Persistable}>
        {(provided) => (
          <StyledTbody
            freezeFirstColumns={!isRecordTableScrolledLeft}
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
