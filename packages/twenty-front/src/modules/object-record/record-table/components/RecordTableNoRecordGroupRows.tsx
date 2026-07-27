import { RecordTableNoRecordGroupAddNew } from '@/object-record/record-table/components/RecordTableNoRecordGroupAddNew';
import { RECORD_TABLE_NO_RECORD_GROUP_DROPPABLE_ID } from '@/object-record/record-table/constants/RecordTableNoRecordGroupDroppableId';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { RecordTableRowVirtualizedContainer } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedContainer';
import { RecordTableVirtualizedBodyPlaceholder } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { RecordTableVirtualizedDebugHelper } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDebugHelper';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { DragDropItemEndDropZone } from '@/ui/utilities/drag-and-drop/components/DragDropItemEndDropZone';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';

const StyledNoRecordGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const RecordTableNoRecordGroupRows = () => {
  const totalNumberOfRecordsToVirtualize =
    useAtomComponentStateValue(
      totalNumberOfRecordsToVirtualizeComponentState,
    ) ?? 0;

  const numberOfRows = Math.min(
    totalNumberOfRecordsToVirtualize,
    NUMBER_OF_VIRTUALIZED_ROWS,
  );

  const virtualRowIndices = getContiguousIncrementalValues(numberOfRows);

  return (
    <StyledNoRecordGroupContainer>
      <RecordTableVirtualizedBodyPlaceholder />
      {virtualRowIndices.map((virtualRowIndex) => {
        return (
          <RecordTableRowVirtualizedContainer
            key={virtualRowIndex}
            virtualIndex={virtualRowIndex}
          />
        );
      })}
      <DragDropItemEndDropZone
        id="record-table-no-record-group-end-drop-zone"
        accept={RECORD_TABLE_ROW_DND_TYPE}
        data={{
          droppableId: RECORD_TABLE_NO_RECORD_GROUP_DROPPABLE_ID,
          index: totalNumberOfRecordsToVirtualize,
        }}
      >
        <RecordTableNoRecordGroupAddNew />
      </DragDropItemEndDropZone>
      <RecordTableVirtualizedDebugHelper />
    </StyledNoRecordGroupContainer>
  );
};
