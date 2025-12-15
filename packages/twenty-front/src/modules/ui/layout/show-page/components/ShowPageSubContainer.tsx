import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { RecordShowRightDrawerOpenRecordButton } from '@/action-menu/components/RecordShowRightDrawerOpenRecordButton';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { FieldsCard } from '@/object-record/record-show/components/FieldsCard';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import { getCardComponent } from '@/object-record/record-show/utils/getCardComponent';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';

import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: start;
  width: 100%;
  overflow: auto;
`;

const StyledTabListContainer = styled.div<{ shouldDisplay: boolean }>`
  ${({ shouldDisplay }) =>
    !shouldDisplay &&
    css`
      height: 0;
      overflow: hidden;
      visibility: hidden;
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
  targetRecordIdentifier: TargetRecordIdentifier;
  isInRightDrawer?: boolean;
  loading: boolean;
};

export const ShowPageSubContainer = ({
  tabs,
  layout,
  targetRecordIdentifier,
  loading,
  isInRightDrawer = false,
}: ShowPageSubContainerProps) => {
  const commandMenuPageComponentInstance = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  );

  const tabListComponentId = getShowPageTabListComponentId({
    pageId: commandMenuPageComponentInstance?.instanceId,
    targetObjectId: targetRecordIdentifier.id,
  });
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const isMobile = useIsMobile();

  const summaryCard = (
    <SummaryCard
      objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
      objectRecordId={targetRecordIdentifier.id}
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

  const isInCommandMenu = isDefined(commandMenuPageComponentInstance);

  const displaySummaryAndFields =
    layout && !layout.hideSummaryAndFields && !isMobile && !isInRightDrawer;

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: tabListComponentId }}
    >
      {displaySummaryAndFields && (
        <ShowPageLeftContainer>
          {summaryCard}
          {fieldsCard}
        </ShowPageLeftContainer>
      )}
      <StyledShowPageRightContainer>
        <StyledTabListContainer shouldDisplay={visibleTabs.length > 1}>
          <StyledTabList
            behaveAsLinks={!isInRightDrawer}
            loading={loading}
            tabs={tabs}
            isInRightDrawer={isInRightDrawer}
            componentInstanceId={tabListComponentId}
          />
        </StyledTabListContainer>
        {(isMobile || isInRightDrawer) && !isInCommandMenu && summaryCard}
        <StyledContentContainer isInRightDrawer={isInRightDrawer}>
          {renderActiveTabContent()}
        </StyledContentContainer>
        {isInRightDrawer && (
          <RightDrawerFooter
            actions={[
              <RecordShowRightDrawerActionMenu />,
              <RecordShowRightDrawerOpenRecordButton
                objectNameSingular={
                  targetRecordIdentifier.targetObjectNameSingular
                }
                recordId={targetRecordIdentifier.id}
              />,
            ]}
          />
        )}
      </StyledShowPageRightContainer>
    </TabListComponentInstanceContext.Provider>
  );
};
