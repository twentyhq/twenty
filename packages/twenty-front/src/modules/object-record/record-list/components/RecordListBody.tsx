import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListEmptyState } from '@/object-record/record-list/components/RecordListEmptyState';
import { RecordListRecords } from '@/object-record/record-list/components/RecordListRecords';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordListRecordsEffect } from '@/object-record/record-list/components/RecordListRecordsEffect';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RecordListBody = () => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const { records, loading, error, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);

  const isEmpty = !loading && !isDefined(error) && records.length === 0;

  return (
    <>
      <RecordListRecordsEffect
        records={records}
        loading={loading}
        error={error}
      />
      {isEmpty ? (
        <RecordListEmptyState />
      ) : (
        <StyledBody>
          {!isDefined(error) && (
            <RecordListRecords
              records={records}
              loading={loading}
              hasNextPage={hasNextPage}
              fetchMoreRecords={fetchMoreRecords}
            />
          )}
        </StyledBody>
      )}
    </>
  );
};
