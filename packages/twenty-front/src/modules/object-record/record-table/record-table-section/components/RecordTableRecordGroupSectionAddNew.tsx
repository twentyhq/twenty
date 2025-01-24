import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { IconPlus } from 'twenty-ui';

export const RecordTableRecordGroupSectionAddNew = () => {
  const { recordTableId, objectMetadataItem } = useRecordTableContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { createNewTableRecordInGroup } = useCreateNewTableRecord({
    objectMetadataItem,
    recordTableId,
  });

  const handleAddNewRecord = () => {
    createNewTableRecordInGroup(currentRecordGroupId);
  };

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
