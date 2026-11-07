import { RecordGroupAllTab } from '@/object-record/record-group/components/RecordGroupAllTab';
import { RecordGroupTab } from '@/object-record/record-group/components/RecordGroupTab';
import { RecordGroupTabsRecordCountsEffect } from '@/object-record/record-group/components/RecordGroupTabsRecordCountsEffect';
import { isAllRecordGroupsTabActiveComponentSelector } from '@/object-record/record-group/states/selectors/isAllRecordGroupsTabActiveComponentSelector';
import { activeRecordGroupTabIdComponentSelector } from '@/object-record/record-group/states/selectors/activeRecordGroupTabIdComponentSelector';
import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { selectedRecordGroupTabIdComponentState } from '@/object-record/record-group/states/selectedRecordGroupTabIdComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type ViewType } from '@/views/types/ViewType';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tabs } from 'twenty-ui/primitives/navigation';

const StyledTabsScrollContainer = styled.div`
  flex-shrink: 0;
  overflow-x: auto;
`;

const StyledTabsList = styled.div`
  min-width: max-content;
`;

type RecordGroupTabsProps = {
  viewType: ViewType;
};

export const RecordGroupTabs = ({ viewType }: RecordGroupTabsProps) => {
  const { t } = useLingui();

  const isRecordGroupTabsDisplayed = useAtomComponentSelectorValue(
    isRecordGroupTabsDisplayedComponentSelector,
  );

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  const activeRecordGroupTabId = useAtomComponentSelectorValue(
    activeRecordGroupTabIdComponentSelector,
  );

  const isAllRecordGroupsTabActive = useAtomComponentSelectorValue(
    isAllRecordGroupsTabActiveComponentSelector,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexShouldHideEmptyRecordGroups = useAtomComponentStateValue(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const setSelectedRecordGroupTabId = useSetAtomComponentState(
    selectedRecordGroupTabIdComponentState,
  );

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const handleRecordGroupTabChange = (recordGroupId: string) => {
    resetRecordSelection();
    setSelectedRecordGroupTabId(recordGroupId);
  };

  if (!isRecordGroupTabsDisplayed) {
    return null;
  }

  return (
    <Tabs.Root
      value={activeRecordGroupTabId}
      onValueChange={handleRecordGroupTabChange}
    >
      <StyledTabsScrollContainer>
        <Tabs.List aria-label={t`Groups`} render={<StyledTabsList />}>
          <RecordGroupAllTab />
          {visibleRecordGroupIds.map((recordGroupId) => (
            <RecordGroupTab key={recordGroupId} recordGroupId={recordGroupId} />
          ))}
        </Tabs.List>
      </StyledTabsScrollContainer>
      {recordIndexShouldHideEmptyRecordGroups &&
        isDefined(recordIndexGroupFieldMetadataItem) && (
          <RecordGroupTabsRecordCountsEffect
            groupByFieldMetadataItem={recordIndexGroupFieldMetadataItem}
          />
        )}
      {/* The grouped body loads the group totals, but All shows the ungrouped one */}
      {isAllRecordGroupsTabActive && <RecordIndexGroupAggregatesDataLoader />}
    </Tabs.Root>
  );
};
