import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListEmptyRecordGroupEffect } from '@/object-record/record-list/components/RecordListEmptyRecordGroupEffect';
import { RecordListRecordGroupSection } from '@/object-record/record-list/components/RecordListRecordGroupSection';
import { RecordListRecords } from '@/object-record/record-list/components/RecordListRecords';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { isRecordListGroupSectionToggledComponentState } from '@/object-record/record-list/states/isRecordListGroupSectionToggledComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 14px;
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

  if (shouldHideRecordGroup) {
    return null;
  }

  return (
    <StyledSection>
      <RecordListEmptyRecordGroupEffect
        loading={loading}
        error={error}
        records={records}
      />
      <RecordListRecordGroupSection />
      <RecordListRecords
        records={records}
        loading={loading}
        error={error}
        hasNextPage={hasNextPage}
        fetchMoreRecords={fetchMoreRecords}
        isVisible={isRecordListGroupSectionToggled}
      />
    </StyledSection>
  );
};
