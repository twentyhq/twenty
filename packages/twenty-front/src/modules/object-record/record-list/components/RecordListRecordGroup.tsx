import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListAddNew } from '@/object-record/record-list/components/RecordListAddNew';
import { RecordListRecordGroupSection } from '@/object-record/record-list/components/RecordListRecordGroupSection';
import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { isRecordListGroupSectionToggledComponentState } from '@/object-record/record-list/states/isRecordListGroupSectionToggledComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
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

  const { records, loading, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecordsInStore({ partialRecords: records });
  }, [records, upsertRecordsInStore]);

  const [, setEmptyRecordGroupById] = useAtomComponentFamilyState(
    emptyRecordGroupByIdComponentFamilyState,
    currentRecordGroupId,
  );

  useEffect(() => {
    if (!loading) {
      setEmptyRecordGroupById(records.length === 0);
    }
  }, [loading, records.length, setEmptyRecordGroupById]);

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
