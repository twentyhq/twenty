import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateNoGroupNoRecordAtAll } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateNoGroupNoRecordAtAll';
import { RecordTableEmptyStateNoRecordFoundForFilter } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateNoRecordFoundForFilter';
import { RecordTableEmptyStateReadOnly } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateReadOnly';
import { RecordTableEmptyStateRemote } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateRemote';
import { RecordTableEmptyStateSoftDelete } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateSoftDelete';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableEmptyState = () => {
  const { recordTableId, objectNameSingular, objectMetadataItem } =
    useRecordTableContextOrThrow();

  const { totalCount } = useFindManyRecords({ objectNameSingular, limit: 1 });
  const noRecordAtAll = totalCount === 0;

  const isRemote = objectMetadataItem.isRemote;

  const isSoftDeleteActive = useRecoilComponentValue(
    isSoftDeleteFilterActiveComponentState,
    recordTableId,
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  if (!hasObjectUpdatePermissions) {
    return <RecordTableEmptyStateReadOnly />;
  }

  if (isRemote) {
    return <RecordTableEmptyStateRemote />;
  } else if (isSoftDeleteActive === true) {
    return <RecordTableEmptyStateSoftDelete />;
  } else if (noRecordAtAll) {
    return <RecordTableEmptyStateNoGroupNoRecordAtAll />;
  } else {
    return <RecordTableEmptyStateNoRecordFoundForFilter />;
  }
};
