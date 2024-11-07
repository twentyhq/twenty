import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefaultId } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { tableRowIdsByGroupComponentSelector } from '@/object-record/record-table/states/selectors/tableRowIdsByGroupComponentSelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';

export const RecordTableRows = () => {
  const recordGroupId = useCurrentRecordGroupId();

  const tableRowIds = useRecoilComponentFamilyValueV2(
    tableRowIdsByGroupComponentSelector,
    recordGroupId,
  );

  return (
    <>
      {tableRowIds.map((recordId, rowIndex) => {
        return (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndex={rowIndex}
          />
        );
      })}
      {recordGroupId !== recordGroupDefaultId && (
        <RecordTableBodyFetchMoreLoader />
      )}
    </>
  );
};
