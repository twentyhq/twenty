import { activeRecordGroupTabIdComponentSelector } from '@/object-record/record-group/states/selectors/activeRecordGroupTabIdComponentSelector';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordListRecordGroupSection } from '@/object-record/record-list/components/RecordListRecordGroupSection';
import { RecordListRecords } from '@/object-record/record-list/components/RecordListRecords';
import { RecordListRecordsEffect } from '@/object-record/record-list/components/RecordListRecordsEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { isRecordListGroupSectionToggledComponentState } from '@/object-record/record-list/states/isRecordListGroupSectionToggledComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 14px;
`;

export const RecordListRecordGroup = () => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const shouldHideRecordGroup = useShouldHideRecordGroup(currentRecordGroupId);

  const { records, loading, error, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);

  const isRecordListGroupSectionToggled = useAtomComponentFamilyStateValue(
    isRecordListGroupSectionToggledComponentState,
    currentRecordGroupId,
  );

  const isRecordGroupTabsDisplayed = useAtomComponentSelectorValue(
    isRecordGroupTabsDisplayedComponentSelector,
  );

  const activeRecordGroupTabId = useAtomComponentSelectorValue(
    activeRecordGroupTabIdComponentSelector,
  );

  const isSectionDisplayed = isRecordGroupTabsDisplayed
    ? activeRecordGroupTabId === currentRecordGroupId
    : !shouldHideRecordGroup;

  const areRecordsDisplayed =
    (isRecordGroupTabsDisplayed || isRecordListGroupSectionToggled) &&
    !isDefined(error);

  return (
    <>
      <RecordListRecordsEffect
        records={records}
        loading={loading}
        error={error}
      />
      {isSectionDisplayed && (
        <StyledSection>
          {!isRecordGroupTabsDisplayed && <RecordListRecordGroupSection />}
          {areRecordsDisplayed && (
            <RecordListRecords
              records={records}
              loading={loading}
              hasNextPage={hasNextPage}
              fetchMoreRecords={fetchMoreRecords}
            />
          )}
        </StyledSection>
      )}
    </>
  );
};
