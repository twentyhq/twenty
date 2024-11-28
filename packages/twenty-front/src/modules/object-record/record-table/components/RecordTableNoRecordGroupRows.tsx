import { recordIndexAllRowIdsComponentState } from '@/object-record/record-index/states/recordIndexAllRowIdsComponentState';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableNoRecordGroupRows = () => {
  const allRowIds = useRecoilComponentValueV2(
    recordIndexAllRowIdsComponentState,
  );

  return (
    <>
      {allRowIds.map((recordId, rowIndex) => {
        return (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndex={rowIndex}
          />
        );
      })}
      <RecordTableBodyFetchMoreLoader />
    </>
  );
};
