import { RecordTableBodyUnselectEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyUnselectEffect';
import { RecordTableNoRecordGroupBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBodyEffect';
import { RecordTableRecordGroupBodyEffects } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupBodyEffects';

export interface RecordTableBodyEffectsWrapperProps {
  hasRecordGroups: boolean;
  tableBodyRef: React.RefObject<HTMLTableElement>;
}

export const RecordTableBodyEffectsWrapper = ({
  hasRecordGroups,
  tableBodyRef,
}: RecordTableBodyEffectsWrapperProps) => (
  <>
    {hasRecordGroups ? (
      <RecordTableRecordGroupBodyEffects />
    ) : (
      <RecordTableNoRecordGroupBodyEffect />
    )}
    <RecordTableBodyUnselectEffect tableBodyRef={tableBodyRef} />
  </>
);
