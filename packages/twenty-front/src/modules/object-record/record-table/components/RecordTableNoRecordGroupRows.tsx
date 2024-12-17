import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableNoRecordGroupRows = () => {
  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  return (
    <>
      {allRecordIds.map((recordId, rowIndex) => {
        return (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndexForFocus={rowIndex}
            rowIndexForDrag={rowIndex}
          />
        );
      })}
      <RecordTableBodyFetchMoreLoader />
    </>
  );
};
