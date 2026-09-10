import { RecordListAddNew } from '@/object-record/record-list/components/RecordListAddNew';
import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';
import { RecordListUpsertRecordsInStoreEffect } from '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';
import { isDefined } from 'twenty-shared/utils';

const StyledFetchMoreTrigger = styled.div`
  height: 0;
`;

type RecordListRecordsProps = {
  records: ObjectRecord[];
  loading: boolean;
  error?: Error;
  hasNextPage: boolean;
  fetchMoreRecords: () => void;
  isVisible?: boolean;
};

export const RecordListRecords = ({
  records,
  loading,
  error,
  hasNextPage,
  fetchMoreRecords,
  isVisible = true,
}: RecordListRecordsProps) => {
  const { ref: fetchMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        fetchMoreRecords();
      }
    },
  });

  return (
    <>
      <RecordListUpsertRecordsInStoreEffect records={records} />
      {isVisible && !isDefined(error) && (
        <>
          {records.map((record) => (
            <RecordListRow key={record.id} recordId={record.id} />
          ))}
          {hasNextPage && !loading && (
            <StyledFetchMoreTrigger ref={fetchMoreRef} />
          )}
          {!loading && <RecordListAddNew />}
        </>
      )}
    </>
  );
};
