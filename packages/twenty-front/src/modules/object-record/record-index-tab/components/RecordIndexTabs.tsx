import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { useRecordIndexTabRecordCounts } from '@/object-record/record-index-tab/hooks/useRecordIndexTabRecordCounts';
import { selectedRecordIndexTabIdComponentState } from '@/object-record/record-index-tab/states/selectedRecordIndexTabIdComponentState';
import { activeRecordIndexTabIdComponentSelector } from '@/object-record/record-index-tab/states/selectors/activeRecordIndexTabIdComponentSelector';
import { isRecordIndexTabsDisplayedComponentSelector } from '@/object-record/record-index-tab/states/selectors/isRecordIndexTabsDisplayedComponentSelector';
import { recordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/recordIndexTabsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledSeparator = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  margin: 0 ${themeCssVariables.spacing[2]};
  width: 1px;
`;

// The view bar draws the bottom border, so the active underline overlaps it
const StyledTabList = styled(TabList)`
  align-self: flex-start;
  height: 40px;

  &::after {
    display: none;
  }
`;

type RecordIndexTabsContentProps = {
  recordIndexTabFieldMetadataItem: FieldMetadataItem;
};

const RecordIndexTabsContent = ({
  recordIndexTabFieldMetadataItem,
}: RecordIndexTabsContentProps) => {
  const { t } = useLingui();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { formatNumber } = useNumberFormat();

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

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const formatRecordCount = (recordCount: number | undefined) =>
    isDefined(recordCount) ? formatNumber(recordCount) : undefined;

  const tabs: SingleTabProps[] = [
    ...recordIndexTabs.map((recordIndexTab) => ({
      id: recordIndexTab.id,
      title: recordIndexTab.label,
      pill: formatRecordCount(
        isDefined(recordCountByRecordIndexTabId)
          ? (recordCountByRecordIndexTabId[recordIndexTab.id] ?? 0)
          : undefined,
      ),
    })),
    {
      id: RECORD_INDEX_ALL_TAB_ID,
      title: t`All`,
      pill: formatRecordCount(totalCount),
    },
  ];

  // A fresh instance per field keeps a stale option from staying selected
  const tabListInstanceId = `record-index-tabs-${recordIndexId}-${recordIndexTabFieldMetadataItem.id}`;

  const handleChangeTab = (recordIndexTabId: string) => {
    if (recordIndexTabId === activeRecordIndexTabId) {
      return;
    }

    resetRecordSelection();
    setSelectedRecordIndexTabId(recordIndexTabId);
  };

  return (
    <StyledContainer>
      <StyledSeparator />
      <TabListRoot componentInstanceId={tabListInstanceId}>
        <StyledTabList
          aria-label={recordIndexTabFieldMetadataItem.label}
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={tabListInstanceId}
          defaultActiveTabId={activeRecordIndexTabId}
          onChangeTab={handleChangeTab}
        />
      </TabListRoot>
    </StyledContainer>
  );
};

export const RecordIndexTabs = () => {
  const isRecordIndexTabsDisplayed = useAtomComponentSelectorValue(
    isRecordIndexTabsDisplayedComponentSelector,
  );

  const recordIndexTabFieldMetadataItem = useAtomComponentStateValue(
    recordIndexTabFieldMetadataItemComponentState,
  );

  if (
    !isRecordIndexTabsDisplayed ||
    !isDefined(recordIndexTabFieldMetadataItem)
  ) {
    return null;
  }

  return (
    <RecordIndexTabsContent
      recordIndexTabFieldMetadataItem={recordIndexTabFieldMetadataItem}
    />
  );
};
