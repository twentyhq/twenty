import { useRef } from 'react';

import { StyledRowSlotPosition } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotPosition';
import { RecordTableRowSlotPositionEffect } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotPositionEffect';
import { RecordTableRowSlotRecordContent } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotRecordContent';

type RecordTableRowSlotRecordProps = {
  recordId: string;
};

export const RecordTableRowSlotRecord = ({
  recordId,
}: RecordTableRowSlotRecordProps) => {
  const rowSlotElementRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <StyledRowSlotPosition
        ref={rowSlotElementRef}
        data-replay-ignore-mutations="true"
      >
        <RecordTableRowSlotRecordContent recordId={recordId} />
      </StyledRowSlotPosition>
      <RecordTableRowSlotPositionEffect
        recordId={recordId}
        rowSlotElementRef={rowSlotElementRef}
      />
    </>
  );
};
