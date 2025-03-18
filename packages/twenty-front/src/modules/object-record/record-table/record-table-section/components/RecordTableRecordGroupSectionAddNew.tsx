import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui';

export const RecordTableRecordGroupSectionAddNew = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const handleAddNewRecord = () => {
    createNewIndexRecord();
  };

  if (hasObjectReadOnlyPermission) {
    return null;
  }

  return (
    <RecordTableActionRow
      draggableId={`add-new-record-${currentRecordGroupId}`}
      draggableIndex={recordIds.length + 2}
      LeftIcon={IconPlus}
      text={t`Add new`}
      onClick={handleAddNewRecord}
    />
  );
};
