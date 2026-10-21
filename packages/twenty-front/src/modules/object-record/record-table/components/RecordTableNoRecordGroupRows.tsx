import { styled } from '@linaria/react';

import { RecordTableNoRecordGroupAddNewDropZone } from '@/object-record/record-table/components/RecordTableNoRecordGroupAddNewDropZone';
import { RecordTableRowSlot } from '@/object-record/record-table/virtualization/components/RecordTableRowSlot';
import { RecordTableVirtualizedBodyPlaceholder } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedBodyPlaceholder';
import { RecordTableVirtualizedDebugHelper } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDebugHelper';
import { ROW_SLOTS } from '@/object-record/record-table/virtualization/constants/RowSlots';

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
