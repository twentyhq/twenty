import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

export const RecordTableRecordGroupRowList = () => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  return recordIndexRecordIdsByGroup.map((recordId) => (
    <RecordTableRow key={recordId} recordId={recordId} />
  ));
};
