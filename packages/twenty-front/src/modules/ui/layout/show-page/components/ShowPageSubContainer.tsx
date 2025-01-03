import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { CardComponents } from '@/object-record/record-show/components/CardComponents';
import { FieldsCard } from '@/object-record/record-show/components/FieldsCard';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

const StyledShowPageRightContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: start;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const StyledTabListContainer = styled.div<{ shouldDisplay: boolean }>`
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing(2)};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: ${({ shouldDisplay }) => (shouldDisplay ? 'flex' : 'none')};
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
`;

const StyledContentContainer = styled.div<{ isInRightDrawer: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding-bottom: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.spacing(16) : 0};
`;

export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';

type ShowPageSubContainerProps = {
  layout?: RecordLayout;
  tabs: SingleTabProps[];
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  isInRightDrawer?: boolean;
  loading: boolean;
  isNewRightDrawerItemLoading?: boolean;
};

export const ShowPageSubContainer = ({
  tabs,
  layout,
  targetableObject,
  loading,
  isInRightDrawer = false,
  isNewRightDrawerItemLoading = false,
}: ShowPageSubContainerProps) => {
  const tabListComponentId = `${TAB_LIST_COMPONENT_ID}-${isInRightDrawer}-${targetableObject.id}`;

  const { activeTabId } = useTabList(tabListComponentId);

  const isMobile = useIsMobile();

  const isNewViewableRecordLoading = useRecoilValue(
    isNewViewableRecordLoadingState,
  );

  const summaryCard = (
    <SummaryCard
      objectNameSingular={targetableObject.targetObjectNameSingular}
      objectRecordId={targetableObject.id}
      isNewRightDrawerItemLoading={isNewRightDrawerItemLoading}
      isInRightDrawer={isInRightDrawer}
    />
  );

  const fieldsCard = (
    <FieldsCard
      objectNameSingular={targetableObject.targetObjectNameSingular}
      objectRecordId={targetableObject.id}
    />
  );

  const renderActiveTabContent = () => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.cards?.length) return null;

    return activeTab.cards.map((card, index) => {
      const CardComponent = CardComponents[card.type];
      return CardComponent ? (
        <CardComponent
          key={`${activeTab.id}-card-${index}`}
          targetableObject={targetableObject}
          isInRightDrawer={isInRightDrawer}
        />
      ) : null;
    });
  };

  const [recordFromStore] = useRecoilState<ObjectRecord | null>(
    recordStoreFamilyState(targetableObject.id),
  );

  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const displaySummaryAndFields =
    layout && !layout.hideSummaryAndFields && !isMobile && !isInRightDrawer;

  return (
    <>
      {displaySummaryAndFields && (
        <ShowPageLeftContainer forceMobile={isMobile}>
          {summaryCard}
          {fieldsCard}
        </ShowPageLeftContainer>
      )}
      <StyledShowPageRightContainer isMobile={isMobile}>
        <StyledTabListContainer shouldDisplay={visibleTabs.length > 1}>
          <TabList
            behaveAsLinks={!isInRightDrawer}
            loading={loading || isNewViewableRecordLoading}
            tabListInstanceId={tabListComponentId}
            tabs={tabs}
            isInRightDrawer={isInRightDrawer}
          />
        </StyledTabListContainer>
        {(isMobile || isInRightDrawer) && summaryCard}
        <StyledContentContainer isInRightDrawer={isInRightDrawer}>
          {renderActiveTabContent()}
        </StyledContentContainer>
        {isInRightDrawer && recordFromStore && !recordFromStore.deletedAt && (
          <RightDrawerFooter actions={[<RecordShowRightDrawerActionMenu />]} />
        )}
      </StyledShowPageRightContainer>
    </>
  );
};
