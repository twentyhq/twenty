import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordIndexTabChip } from '@/object-record/record-index-tab/components/RecordIndexTabChip';
import { RecordIndexTabCount } from '@/object-record/record-index-tab/components/RecordIndexTabCount';
import { RecordIndexTabsHiddenMeasurements } from '@/object-record/record-index-tab/components/RecordIndexTabsHiddenMeasurements';
import { RecordIndexTabsMoreDropdown } from '@/object-record/record-index-tab/components/RecordIndexTabsMoreDropdown';
import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { useRecordIndexTabRecordCounts } from '@/object-record/record-index-tab/hooks/useRecordIndexTabRecordCounts';
import { selectedRecordIndexTabIdComponentState } from '@/object-record/record-index-tab/states/selectedRecordIndexTabIdComponentState';
import { activeRecordIndexTabIdComponentSelector } from '@/object-record/record-index-tab/states/selectors/activeRecordIndexTabIdComponentSelector';
import { recordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/recordIndexTabsComponentSelector';
import { type RecordIndexTabItem } from '@/object-record/record-index-tab/types/RecordIndexTabItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { useIsMobile } from 'twenty-ui/utilities';

// Lets the tab row shrink to its container so overflow tabs can be measured
const StyledContainer = styled.div`
  min-width: 0;
`;

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

type RecordIndexTabsContentProps = {
  recordIndexTabFieldMetadataItem: FieldMetadataItem;
};

export const RecordIndexTabsContent = ({
  recordIndexTabFieldMetadataItem,
}: RecordIndexTabsContentProps) => {
  const { t } = useLingui();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const recordIndexTabs = useAtomComponentSelectorValue(
    recordIndexTabsComponentSelector,
  );

  const activeRecordIndexTabId = useAtomComponentSelectorValue(
    activeRecordIndexTabIdComponentSelector,
  );

  const setSelectedRecordIndexTabId = useSetAtomComponentState(
    selectedRecordIndexTabIdComponentState,
  );

  const { recordCountByRecordIndexTabId } = useRecordIndexTabRecordCounts(
    recordIndexTabFieldMetadataItem,
  );

  const { totalCount } = useGetRecordIndexTotalCount();

  const allTabLabel = t`All`;

  const recordIndexTabItems = useMemo<RecordIndexTabItem[]>(
    () => [
      ...recordIndexTabs.map((recordIndexTab) => ({
        ...recordIndexTab,
        recordCount: isDefined(recordCountByRecordIndexTabId)
          ? (recordCountByRecordIndexTabId[recordIndexTab.id] ?? 0)
          : undefined,
      })),
      {
        id: RECORD_INDEX_ALL_TAB_ID,
        label: allTabLabel,
        color: null,
        recordCount: totalCount,
      },
    ],
    [allTabLabel, recordCountByRecordIndexTabId, recordIndexTabs, totalCount],
  );

  const {
    visibleTabCount,
    hiddenTabs,
    onTabWidthChange,
    onContainerWidthChange,
    onMoreButtonWidthChange,
  } = useTabListMeasurements({
    visibleTabs: recordIndexTabItems,
    horizontalPadding: 0,
  });

  // Matches TabList, which scrolls tabs on mobile instead of collapsing them
  const isMobile = useIsMobile();

  const renderedRecordIndexTabItems = isMobile
    ? recordIndexTabItems
    : recordIndexTabItems.slice(0, visibleTabCount);

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const handleRecordIndexTabChange = (recordIndexTabId: string) => {
    resetRecordSelection();
    setSelectedRecordIndexTabId(recordIndexTabId);
  };

  return (
    <StyledContainer>
      <Tabs.Root
        value={activeRecordIndexTabId}
        onValueChange={handleRecordIndexTabChange}
      >
        {!isMobile && (
          <RecordIndexTabsHiddenMeasurements
            recordIndexTabItems={recordIndexTabItems}
            onTabWidthChange={onTabWidthChange}
            onMoreButtonWidthChange={onMoreButtonWidthChange}
          />
        )}
        <StyledNodeDimension onDimensionChange={onContainerWidthChange}>
          <StyledTabsRow>
            <Tabs.List
              aria-label={recordIndexTabFieldMetadataItem.label}
              render={<StyledTabsList isScrollable={isMobile} />}
            >
              {renderedRecordIndexTabItems.map((recordIndexTabItem) => (
                <Tabs.Tab
                  key={recordIndexTabItem.id}
                  variant="filled"
                  value={recordIndexTabItem.id}
                  badge={
                    <RecordIndexTabCount
                      recordIndexTabItem={recordIndexTabItem}
                    />
                  }
                >
                  <RecordIndexTabChip recordIndexTabItem={recordIndexTabItem} />
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {!isMobile && hiddenTabs.length > 0 && (
              <RecordIndexTabsMoreDropdown
                dropdownId={`record-index-tabs-more-${recordIndexId}`}
                hiddenRecordIndexTabItems={hiddenTabs}
                activeRecordIndexTabId={activeRecordIndexTabId}
                onRecordIndexTabSelect={handleRecordIndexTabChange}
              />
            )}
          </StyledTabsRow>
        </StyledNodeDimension>
      </Tabs.Root>
    </StyledContainer>
  );
};
