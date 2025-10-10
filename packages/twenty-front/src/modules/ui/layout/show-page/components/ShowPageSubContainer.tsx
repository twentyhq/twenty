import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { RecordShowRightDrawerOpenRecordButton } from '@/action-menu/components/RecordShowRightDrawerOpenRecordButton';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { FieldsCard } from '@/object-record/record-show/components/FieldsCard';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import { getCardComponent } from '@/object-record/record-show/utils/getCardComponent';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { PageLayoutType } from '~/generated/graphql';

import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import React from 'react';

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
  ${({ shouldDisplay }) =>
    !shouldDisplay &&
    `
    visibility: hidden;
    height: 0;
    overflow: hidden;
  `}
`;

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledContentContainer = styled.div<{ isInRightDrawer: boolean }>`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.background.primary};
  padding-bottom: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.spacing(16) : 0};
`;

type ShowPageSubContainerProps = {
  layout?: RecordLayout;
  tabs: SingleTabProps[];
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  isInRightDrawer?: boolean;
  loading: boolean;
};

export const ShowPageSubContainer = ({
  tabs,
  layout,
  targetableObject,
  loading,
  isInRightDrawer = false,
}: ShowPageSubContainerProps) => {
  const commandMenuPageComponentInstance = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  );

  const tabListComponentId = getShowPageTabListComponentId({
    pageId: commandMenuPageComponentInstance?.instanceId,
    targetObjectId: targetableObject.id,
  });
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const isMobile = useIsMobile();

  const summaryCard = (
    <SummaryCard
      objectNameSingular={targetableObject.targetObjectNameSingular}
      objectRecordId={targetableObject.id}
      isInRightDrawer={isInRightDrawer}
    />
  );

  const fieldsCard = <FieldsCard />;

  const renderActiveTabContent = () => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.cards?.length) return null;

    return (
      <>
        {activeTab.cards.map((card, index) => (
          <React.Fragment key={`${activeTab.id}-card-${index}`}>
            {getCardComponent(card.type, card.configuration)}
          </React.Fragment>
        ))}
      </>
    );
  };

  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const displaySummaryAndFields =
    layout && !layout.hideSummaryAndFields && !isMobile && !isInRightDrawer;

  return (
    <LayoutRenderingProvider
      value={{
        targetRecord: {
          id: targetableObject.id,
          targetObjectNameSingular: targetableObject.targetObjectNameSingular,
        },
        layoutType: PageLayoutType.RECORD_PAGE,
        isInRightDrawer,
      }}
    >
      <TabListComponentInstanceContext.Provider
        value={{ instanceId: tabListComponentId }}
      >
        {displaySummaryAndFields && (
          <ShowPageLeftContainer forceMobile={isMobile}>
            {summaryCard}
            {fieldsCard}
          </ShowPageLeftContainer>
        )}
        <StyledShowPageRightContainer isMobile={isMobile}>
          <StyledTabListContainer shouldDisplay={visibleTabs.length > 1}>
            <StyledTabList
              behaveAsLinks={!isInRightDrawer}
              loading={loading}
              tabs={tabs}
              isInRightDrawer={isInRightDrawer}
              componentInstanceId={tabListComponentId}
            />
          </StyledTabListContainer>
          {(isMobile || isInRightDrawer) && summaryCard}
          <StyledContentContainer isInRightDrawer={isInRightDrawer}>
            {renderActiveTabContent()}
          </StyledContentContainer>
          {isInRightDrawer && (
            <RightDrawerFooter
              actions={[
                <RecordShowRightDrawerActionMenu />,
                <RecordShowRightDrawerOpenRecordButton
                  objectNameSingular={targetableObject.targetObjectNameSingular}
                  recordId={targetableObject.id}
                />,
              ]}
            />
          )}
        </StyledShowPageRightContainer>
      </TabListComponentInstanceContext.Provider>
    </LayoutRenderingProvider>
  );
};
