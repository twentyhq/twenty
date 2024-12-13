import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { recordTablePendingRecordIdByGroupComponentFamilyState } from '@/object-record/record-table/states/recordTablePendingRecordIdByGroupComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { IconPlus } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

export const RecordTableRecordGroupSectionAddNew = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const pendingRecordId = useRecoilComponentFamilyValueV2(
    recordTablePendingRecordIdByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  const recordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { createNewTableRecordInGroup } =
    useCreateNewTableRecord(recordTableId);

  const handleAddNewRecord = () => {
    createNewTableRecordInGroup(currentRecordGroupId);
  };

  if (isDefined(pendingRecordId)) return null;

  return (
    <RecordTableActionRow
      draggableId={`add-new-record-${currentRecordGroupId}`}
      draggableIndex={recordIds.length + 2}
      LeftIcon={IconPlus}
      text="Add new"
      onClick={handleAddNewRecord}
    />
  );
};
