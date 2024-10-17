import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateNoRecordAtAll } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateNoRecordAtAll';
import { RecordTableEmptyStateNoRecordFoundForFilter } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateNoRecordFoundForFilter';
import { RecordTableEmptyStateRemote } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateRemote';
import { RecordTableEmptyStateSoftDelete } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateSoftDelete';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export const RecordTableEmptyState = () => {
  const { objectNameSingular, recordTableId, objectMetadataItem } =
    useContext(RecordTableContext);

  const { isSoftDeleteActiveState } = useRecordTableStates(recordTableId);

  const { totalCount } = useFindManyRecords({ objectNameSingular, limit: 1 });
  const noRecordAtAll = totalCount === 0;

  const isRemote = objectMetadataItem.isRemote;

  const isSoftDeleteActive = useRecoilValue(isSoftDeleteActiveState);

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
