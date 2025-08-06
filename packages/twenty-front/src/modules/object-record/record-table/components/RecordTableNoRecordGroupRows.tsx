import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableAddNew } from '@/object-record/record-table/components/RecordTableAddNew';
import { RecordTableBodyDroppablePlaceholder } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppablePlaceholder';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFetchMoreLoader';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableNoRecordGroupRows = () => {
  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const isRecordTableInitialLoading = useRecoilComponentValue(
    isRecordTableInitialLoadingComponentState,
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
      <RecordTableAddNew />
      <RecordTableBodyFetchMoreLoader />
      <RecordTableBodyDroppablePlaceholder />
      {!isRecordTableInitialLoading && allRecordIds.length > 0 && (
        <RecordTableAggregateFooter />
      )}
    </>
  );
};
