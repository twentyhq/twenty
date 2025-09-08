import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableAddNew } from '@/object-record/record-table/components/RecordTableAddNew';
import { RecordTableBodyDroppablePlaceholder } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppablePlaceholder';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableNoRecordGroupRows = () => {
  const allRecordIds = useRecoilComponentValue(
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
      <RecordTableBodyDroppablePlaceholder />
      <RecordTableAddNew />
    </>
  );
};
