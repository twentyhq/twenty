import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListAddNew } from '@/object-record/record-list/components/RecordListAddNew';
import { RecordListEmptyRecordGroupEffect } from '@/object-record/record-list/components/RecordListEmptyRecordGroupEffect';
import { RecordListRecordGroupSection } from '@/object-record/record-list/components/RecordListRecordGroupSection';
import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';
import { RecordListUpsertRecordsInStoreEffect } from '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { isRecordListGroupSectionToggledComponentState } from '@/object-record/record-list/states/isRecordListGroupSectionToggledComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 14px;
`;

const StyledFetchMoreTrigger = styled.div`
  height: 0;
`;

export const RecordListRecordGroup = () => {
  const { objectNameSingular } = useRecordListContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const shouldHideRecordGroup = useShouldHideRecordGroup(currentRecordGroupId);

  const { records, loading, error, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);

  const isRecordListGroupSectionToggled = useAtomComponentFamilyStateValue(
    isRecordListGroupSectionToggledComponentState,
    currentRecordGroupId,
  );

  const { ref: fetchMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        fetchMoreRecords();
      }
    },
  });

  if (shouldHideRecordGroup) {
    return null;
  }

  return (
    <StyledSection>
      <RecordListUpsertRecordsInStoreEffect records={records} />
      <RecordListEmptyRecordGroupEffect
        loading={loading}
        error={error}
        records={records}
      />
      <RecordListRecordGroupSection />
      {isRecordListGroupSectionToggled && (
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
    </StyledSection>
  );
};
