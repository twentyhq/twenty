import { useRef } from 'react';

import { RecordTableRowSlotContainer } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotContainer';
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
      <RecordTableRowSlotContainer ref={rowSlotElementRef}>
        <RecordTableRowSlotRecordContent recordId={recordId} />
      </RecordTableRowSlotContainer>
      <RecordTableRowSlotPositionEffect
        recordId={recordId}
        rowSlotElementRef={rowSlotElementRef}
      />
    </>
  );
};
