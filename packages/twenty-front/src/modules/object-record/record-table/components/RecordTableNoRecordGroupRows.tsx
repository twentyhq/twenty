import { styled } from '@linaria/react';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';

import { RecordTableNoRecordGroupAddNewDropZone } from '@/object-record/record-table/components/RecordTableNoRecordGroupAddNewDropZone';
import { RecordTableRowSlot } from '@/object-record/record-table/virtualization/components/RecordTableRowSlot';
import { RecordTableVirtualizedBodyPlaceholder } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { RecordTableVirtualizedDebugHelper } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDebugHelper';
import { ROW_SLOT_COUNT } from '@/object-record/record-table/virtualization/constants/RowSlotCount';

const ROW_SLOTS = getContiguousIncrementalValues(ROW_SLOT_COUNT);

const StyledNoRecordGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const RecordTableNoRecordGroupRows = () => (
  <StyledNoRecordGroupContainer>
    <RecordTableVirtualizedBodyPlaceholder />
    {ROW_SLOTS.map((rowSlot) => (
      <RecordTableRowSlot key={rowSlot} rowSlot={rowSlot} />
    ))}
    <RecordTableNoRecordGroupAddNewDropZone />
    <RecordTableVirtualizedDebugHelper />
  </StyledNoRecordGroupContainer>
);
