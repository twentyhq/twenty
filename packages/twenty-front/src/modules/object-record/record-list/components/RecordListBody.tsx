import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListAddNew } from '@/object-record/record-list/components/RecordListAddNew';
import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';
import { RecordListUpsertRecordsInStoreEffect } from '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledFetchMoreTrigger = styled.div`
  height: 0;
`;

export const RecordListBody = () => {
  const { objectNameSingular } = useRecordListContextOrThrow();

  const { records, loading, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);

  const { ref: fetchMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        fetchMoreRecords();
      }
    },
  });

  return (
    <StyledBody>
      <RecordListUpsertRecordsInStoreEffect records={records} />
      {records.map((record) => (
        <RecordListRow key={record.id} recordId={record.id} />
      ))}
      {hasNextPage && !loading && <StyledFetchMoreTrigger ref={fetchMoreRef} />}
      {!loading && <RecordListAddNew />}
    </StyledBody>
  );
};
