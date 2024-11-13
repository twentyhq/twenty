import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { tableRowIdsByGroupComponentFamilyState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';

export const RecordTableRecordGroupRows = () => {
  const recordGroupId = useCurrentRecordGroupId();

  const recordGroupRowIds = useRecoilComponentFamilyValueV2(
    tableRowIdsByGroupComponentFamilyState,
    recordGroupId,
  );

  return recordGroupRowIds.map((recordId, rowIndex) => {
    return (
      <RecordTableRow key={recordId} recordId={recordId} rowIndex={rowIndex} />
    );
  });
};
