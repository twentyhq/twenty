import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { tableAllRowIdsComponentState } from '@/object-record/record-table/states/tableAllRowIdsComponentState';
import { tableRowIdsByGroupComponentFamilyState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableRecordGroupRows = () => {
  const recordGroupId = useCurrentRecordGroupId();

  const allRowIds = useRecoilComponentValueV2(tableAllRowIdsComponentState);

  const recordGroupRowIds = useRecoilComponentFamilyValueV2(
    tableRowIdsByGroupComponentFamilyState,
    recordGroupId,
  );

  return recordGroupRowIds.map((recordId) => {
    // Find the index of the recordId in allRowIds
    const rowIndex = allRowIds.indexOf(recordId);

    return (
      <RecordTableRow key={recordId} recordId={recordId} rowIndex={rowIndex} />
    );
  });
};
