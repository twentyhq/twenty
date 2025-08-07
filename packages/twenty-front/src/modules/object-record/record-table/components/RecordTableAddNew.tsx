import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';

export const RecordTableAddNew = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const recordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const hasRecordTableFetchedAllRecords = useRecoilComponentValue(
    hasRecordTableFetchedAllRecordsComponentState,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  if (!hasObjectUpdatePermissions || !hasRecordTableFetchedAllRecords) {
    return null;
  }

  return (
    <RecordTableActionRow
      draggableId="add-new-record"
      draggableIndex={recordIds.length + 1}
      LeftIcon={IconPlus}
      text={t`Add new`}
      onClick={() => {
        createNewIndexRecord({
          position: 'last',
        });
      }}
    />
  );
};
