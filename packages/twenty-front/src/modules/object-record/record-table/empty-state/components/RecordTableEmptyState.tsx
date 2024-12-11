import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateNoRecordAtAll } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateNoRecordAtAll';
import { RecordTableEmptyStateNoRecordFoundForFilter } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateNoRecordFoundForFilter';
import { RecordTableEmptyStateRemote } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateRemote';
import { RecordTableEmptyStateSoftDelete } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateSoftDelete';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableEmptyState = () => {
  const { recordTableId, objectNameSingular, objectMetadataItem } =
    useRecordTableContextOrThrow();

  const { totalCount } = useFindManyRecords({ objectNameSingular, limit: 1 });
  const noRecordAtAll = totalCount === 0;

  const isRemote = objectMetadataItem.isRemote;

  const isSoftDeleteActive = useRecoilComponentValueV2(
    isSoftDeleteFilterActiveComponentState,
    recordTableId,
  );

  if (isRemote) {
    return <RecordTableEmptyStateRemote />;
  } else if (isSoftDeleteActive === true) {
    return <RecordTableEmptyStateSoftDelete />;
  } else if (noRecordAtAll) {
    return <RecordTableEmptyStateNoRecordAtAll />;
  } else {
    return <RecordTableEmptyStateNoRecordFoundForFilter />;
  }
};
