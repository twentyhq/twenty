import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListEmptyState } from '@/object-record/record-list/components/RecordListEmptyState';
import { RecordListRecords } from '@/object-record/record-list/components/RecordListRecords';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RecordListBody = () => {
  const { objectNameSingular } = useRecordListContextOrThrow();

  const { records, loading, error, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);

  const isEmpty = !loading && !isDefined(error) && records.length === 0;

  if (isEmpty) {
    return <RecordListEmptyState />;
  }

  return (
    <StyledBody>
      <RecordListRecords
        records={records}
        loading={loading}
        error={error}
        hasNextPage={hasNextPage}
        fetchMoreRecords={fetchMoreRecords}
      />
    </StyledBody>
  );
};
