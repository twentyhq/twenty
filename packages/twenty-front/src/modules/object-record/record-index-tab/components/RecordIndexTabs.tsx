import { RECORD_INDEX_NO_VALUE_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexNoValueTabId';
import { RECORD_INDEX_TAB_QUERY_PARAM_KEY } from '@/object-record/record-index-tab/constants/RecordIndexTabQueryParamKey';
import { useRecordIndexTabRecordCounts } from '@/object-record/record-index-tab/hooks/useRecordIndexTabRecordCounts';
import { selectedRecordIndexTabIdComponentState } from '@/object-record/record-index-tab/states/selectedRecordIndexTabIdComponentState';
import { activeRecordIndexTabIdComponentSelector } from '@/object-record/record-index-tab/states/selectors/activeRecordIndexTabIdComponentSelector';
import { isRecordIndexTabsDisplayedComponentSelector } from '@/object-record/record-index-tab/states/selectors/isRecordIndexTabsDisplayedComponentSelector';
import { visibleRecordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/visibleRecordIndexTabsComponentSelector';
import { recordIndexViewTabsComponentState } from '@/object-record/record-index-tab/states/recordIndexViewTabsComponentState';
import { type RecordIndexTab } from '@/object-record/record-index-tab/types/RecordIndexTab';
import { RecordIndexCustomTabCount } from '@/object-record/record-index-tab/components/RecordIndexCustomTabCount';
import { useGetRecordIndexTabLabel } from '@/object-record/record-index-tab/hooks/useGetRecordIndexTabLabel';
import { getRecordIndexTabColorDotIcon } from '@/object-record/record-index-tab/utils/getRecordIndexTabColorDotIcon';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useSearchParams } from 'react-router-dom';
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

const RecordIndexTabsContent = () => {
  const { t } = useLingui();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { formatNumber } = useNumberFormat();

  const { getRecordIndexTabLabel } = useGetRecordIndexTabLabel();

  const recordIndexTabFieldMetadataItem = useAtomComponentStateValue(
    recordIndexTabFieldMetadataItemComponentState,
  );

  const visibleRecordIndexTabs = useAtomComponentSelectorValue(
    visibleRecordIndexTabsComponentSelector,
  );

  const recordIndexViewTabs = useAtomComponentStateValue(
    recordIndexViewTabsComponentState,
  );

  const activeRecordIndexTabId = useAtomComponentSelectorValue(
    activeRecordIndexTabIdComponentSelector,
  );

  const [selectedRecordIndexTabId, setSelectedRecordIndexTabId] =
    useAtomComponentState(selectedRecordIndexTabIdComponentState);

  const { recordCountByRecordIndexTabId } = useRecordIndexTabRecordCounts(
    recordIndexTabFieldMetadataItem,
  );

  const { totalCount } = useGetRecordIndexTotalCount();

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const [searchParams, setSearchParams] = useSearchParams();

  const formatRecordCount = (recordCount: number | undefined) =>
    isDefined(recordCount) ? formatNumber(recordCount) : undefined;

  const getRecordCount = (recordIndexTabId: string) =>
    isDefined(recordCountByRecordIndexTabId)
      ? (recordCountByRecordIndexTabId[recordIndexTabId] ?? 0)
      : undefined;

  const noValueRecordCount = getRecordCount(RECORD_INDEX_NO_VALUE_TAB_ID);

  const shouldShowNoValueTab =
    (isDefined(noValueRecordCount) && noValueRecordCount > 0) ||
    activeRecordIndexTabId === RECORD_INDEX_NO_VALUE_TAB_ID;

  const getTabPill = (recordIndexTab: RecordIndexTab) => {
    switch (recordIndexTab.kind) {
      case 'all':
        return formatRecordCount(totalCount);
      case 'noValue':
        return formatRecordCount(noValueRecordCount);
      case 'custom':
        return (
          <RecordIndexCustomTabCount
            viewFilters={
              recordIndexViewTabs.find(
                ({ id }) => id === recordIndexTab.viewTabId,
              )?.viewFilters ?? []
            }
          />
        );
      default:
        return formatRecordCount(getRecordCount(recordIndexTab.id));
    }
  };

  const tabs: SingleTabProps[] = visibleRecordIndexTabs
    .filter(({ kind }) => kind !== 'noValue' || shouldShowNoValueTab)
    .map((recordIndexTab) => ({
      id: recordIndexTab.id,
      title: getRecordIndexTabLabel(recordIndexTab),
      Icon: isDefined(recordIndexTab.color)
        ? getRecordIndexTabColorDotIcon(recordIndexTab.color)
        : undefined,
      pill: getTabPill(recordIndexTab),
    }));

  const tabIdFromQueryParams = searchParams.get(
    RECORD_INDEX_TAB_QUERY_PARAM_KEY,
  );

  // TabList adopts its default once, so a shared link must win before any click
  const defaultActiveTabId =
    !isDefined(selectedRecordIndexTabId) &&
    tabs.some(({ id }) => id === tabIdFromQueryParams)
      ? (tabIdFromQueryParams ?? activeRecordIndexTabId)
      : activeRecordIndexTabId;

  // A fresh instance per field keeps a stale option from staying selected
  const tabListInstanceId = `record-index-tabs-${recordIndexId}-${recordIndexTabFieldMetadataItem?.id ?? 'custom'}`;

  const handleChangeTab = (recordIndexTabId: string) => {
    if (recordIndexTabId === activeRecordIndexTabId) {
      return;
    }

    resetRecordSelection();
    setSelectedRecordIndexTabId(recordIndexTabId);
    setSearchParams(
      (previousSearchParams) => {
        const nextSearchParams = new URLSearchParams(previousSearchParams);

        nextSearchParams.set(
          RECORD_INDEX_TAB_QUERY_PARAM_KEY,
          recordIndexTabId,
        );

        return nextSearchParams;
      },
      { replace: true },
    );
  };

  return (
    <StyledContainer>
      <StyledSeparator />
      <TabListRoot componentInstanceId={tabListInstanceId}>
        <StyledTabList
          aria-label={recordIndexTabFieldMetadataItem?.label ?? t`Tabs`}
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={tabListInstanceId}
          defaultActiveTabId={defaultActiveTabId}
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

  if (!isRecordIndexTabsDisplayed) {
    return null;
  }

  return <RecordIndexTabsContent />;
};
