import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListRecords } from '@/object-record/record-list/components/RecordListRecords';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { styled } from '@linaria/react';

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RecordListBody = () => {
  const { objectNameSingular } = useRecordListContextOrThrow();

  const { records, loading, error, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);

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
