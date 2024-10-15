import { MultipleRecordsActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/MultipleRecordsActionMenuEntriesSetter';
import { SingleRecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/SingleRecordActionMenuEntriesSetter';
import { useContextStoreSelectedRecords } from '@/context-store/hooks/useContextStoreSelectedRecords';

export const RecordActionMenuEntriesSetter = () => {
  const { totalCount } = useContextStoreSelectedRecords({ limit: 1 });

  if (!totalCount) {
    return null;
  }

  if (totalCount === 1) {
    return <SingleRecordActionMenuEntriesSetter />;
  }

  return <MultipleRecordsActionMenuEntriesSetter />;
};
