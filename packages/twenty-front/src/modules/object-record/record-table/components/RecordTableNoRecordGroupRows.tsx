import { styled } from '@linaria/react';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';

import { RecordTableNoRecordGroupAddNew } from '@/object-record/record-table/components/RecordTableNoRecordGroupAddNew';
import { RecordDragEndDropZone } from '@/object-record/record-drag/components/RecordDragEndDropZone';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { RecordTableRowVirtualizedContainer } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedContainer';
import { RecordTableVirtualizedBodyPlaceholder } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { RecordTableVirtualizedDebugHelper } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDebugHelper';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

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
      <RecordDragEndDropZone
        droppableId={NO_RECORD_GROUP_FAMILY_KEY}
        dndType={RECORD_TABLE_ROW_DND_TYPE}
        index={totalNumberOfRecordsToVirtualize}
      >
        <RecordTableNoRecordGroupAddNew />
      </RecordDragEndDropZone>
      <RecordTableVirtualizedDebugHelper />
    </StyledNoRecordGroupContainer>
  );
};
