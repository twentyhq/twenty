import { RecordGroupAllTab } from '@/object-record/record-group/components/RecordGroupAllTab';
import { RecordGroupTab } from '@/object-record/record-group/components/RecordGroupTab';
import { RecordGroupTabsHiddenMeasurements } from '@/object-record/record-group/components/RecordGroupTabsHiddenMeasurements';
import { RecordGroupTabsMoreDropdown } from '@/object-record/record-group/components/RecordGroupTabsMoreDropdown';
import { RecordGroupTabsRecordCountsEffect } from '@/object-record/record-group/components/RecordGroupTabsRecordCountsEffect';
import { RecordGroupTabsSelectionResetEffect } from '@/object-record/record-group/components/RecordGroupTabsSelectionResetEffect';
import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';
import { RecordGroupTabsPortalContext } from '@/object-record/record-group/states/context/RecordGroupTabsPortalContext';
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
import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type ViewType } from '@/views/types/ViewType';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledTabsRow = styled.div`
  align-items: center;
  display: flex;
  min-width: 0;
`;

const StyledTabsList = styled.div<{ isScrollable: boolean }>`
  min-width: 0;
  overflow-x: ${({ isScrollable }) => (isScrollable ? 'auto' : 'hidden')};
`;

const StyledNodeDimension = styled(NodeDimension)`
  display: flex;
  min-width: 0;
`;

type RecordGroupTabsProps = {
  viewType: ViewType;
  dndType: string;
};

// Mounted in the rows' drag-and-drop provider to be drop targets, portaled above the rows
export const RecordGroupTabs = ({
  viewType,
  dndType,
}: RecordGroupTabsProps) => {
  const { t } = useLingui();

  const recordGroupTabsPortalElement = useContext(RecordGroupTabsPortalContext);

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

  const recordGroupTabs = useMemo(
    () =>
      [ALL_RECORD_GROUPS_TAB_ID, ...visibleRecordGroupIds].map(
        (recordGroupTabId) => ({ id: recordGroupTabId }),
      ),
    [visibleRecordGroupIds],
  );

  const {
    visibleTabCount,
    hiddenTabs,
    onTabWidthChange,
    onContainerWidthChange,
    onMoreButtonWidthChange,
  } = useTabListMeasurements({
    visibleTabs: recordGroupTabs,
    horizontalPadding: 0,
  });

  // Matches TabList, which scrolls tabs on mobile instead of collapsing them
  const isMobile = useIsMobile();

  const renderedRecordGroupTabs = isMobile
    ? recordGroupTabs
    : recordGroupTabs.slice(0, visibleTabCount);

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const handleRecordGroupTabChange = (recordGroupId: string) => {
    resetRecordSelection();
    setSelectedRecordGroupTabId(recordGroupId);
  };

  if (!isRecordGroupTabsDisplayed || !isDefined(recordGroupTabsPortalElement)) {
    return null;
  }

  return createPortal(
    <Tabs.Root
      value={activeRecordGroupTabId}
      onValueChange={handleRecordGroupTabChange}
    >
      {!isMobile && (
        <RecordGroupTabsHiddenMeasurements
          recordGroupTabIds={recordGroupTabs.map(({ id }) => id)}
          onTabWidthChange={onTabWidthChange}
          onMoreButtonWidthChange={onMoreButtonWidthChange}
        />
      )}
      <StyledNodeDimension onDimensionChange={onContainerWidthChange}>
        <StyledTabsRow>
          <Tabs.List
            aria-label={t`Groups`}
            render={<StyledTabsList isScrollable={isMobile} />}
          >
            {renderedRecordGroupTabs.map(({ id: recordGroupTabId }) =>
              recordGroupTabId === ALL_RECORD_GROUPS_TAB_ID ? (
                <RecordGroupAllTab key={recordGroupTabId} />
              ) : (
                <RecordGroupTab
                  key={recordGroupTabId}
                  recordGroupId={recordGroupTabId}
                  dndType={dndType}
                />
              ),
            )}
          </Tabs.List>
          {!isMobile && hiddenTabs.length > 0 && (
            <RecordGroupTabsMoreDropdown
              dropdownId={`record-group-tabs-more-${recordIndexId}`}
              hiddenRecordGroupTabIds={hiddenTabs.map(({ id }) => id)}
              activeRecordGroupTabId={activeRecordGroupTabId}
              onRecordGroupTabSelect={handleRecordGroupTabChange}
            />
          )}
        </StyledTabsRow>
      </StyledNodeDimension>
      <RecordGroupTabsSelectionResetEffect />
      {recordIndexShouldHideEmptyRecordGroups &&
        isDefined(recordIndexGroupFieldMetadataItem) && (
          <RecordGroupTabsRecordCountsEffect
            groupByFieldMetadataItem={recordIndexGroupFieldMetadataItem}
          />
        )}
      {/* The grouped body loads the group totals, but All shows the ungrouped one */}
      {isAllRecordGroupsTabActive && <RecordIndexGroupAggregatesDataLoader />}
    </Tabs.Root>,
    recordGroupTabsPortalElement,
  );
};
