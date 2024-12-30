import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab/components/TabListFromUrlOptionalEffect';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { TabListScope } from '@/ui/layout/tab/scopes/TabListScope';
import { LayoutCard } from '@/ui/layout/tab/types/LayoutCard';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import * as React from 'react';
import { useEffect } from 'react';
import { IconComponent } from 'twenty-ui';
import { Tab } from './Tab';

export type SingleTabProps = {
  title: string;
  Icon?: IconComponent;
  id: string;
  hide?: boolean;
  disabled?: boolean;
  pill?: string | React.ReactElement;
  cards?: LayoutCard[];
  logo?: string;
};

type TabListProps = {
  tabListInstanceId: string;
  tabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks?: boolean;
  className?: string;
  isInRightDrawer?: boolean;
};

const StyledContainer = styled.div`
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  user-select: none;
`;

export const TabList = ({
  tabs,
  tabListInstanceId,
  loading,
  behaveAsLinks = true,
  isInRightDrawer,
  className,
}: TabListProps) => {
  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const { activeTabId, setActiveTabId } = useTabList(tabListInstanceId);

  const initialActiveTabId = activeTabId || visibleTabs[0]?.id || '';

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  if (visibleTabs.length <= 1) {
    return null;
  }

  return (
    <TabListScope tabListScopeId={tabListInstanceId}>
      <TabListFromUrlOptionalEffect
        isInRightDrawer={!!isInRightDrawer}
        componentInstanceId={tabListInstanceId}
        tabListIds={tabs.map((tab) => tab.id)}
      />
      <ScrollWrapper
        defaultEnableYScroll={false}
        contextProviderName="tabList"
        componentInstanceId={`scroll-wrapper-tab-list-${tabListInstanceId}`}
      >
        <StyledContainer className={className}>
          {visibleTabs.map((tab) => (
            <Tab
              id={tab.id}
              key={tab.id}
              title={tab.title}
              Icon={tab.Icon}
              logo={tab.logo}
              active={tab.id === activeTabId}
              disabled={tab.disabled ?? loading}
              pill={tab.pill}
              to={behaveAsLinks ? `#${tab.id}` : undefined}
              onClick={() => {
                if (!behaveAsLinks) {
                  setActiveTabId(tab.id);
                }
              }}
            />
          ))}
        </StyledContainer>
      </ScrollWrapper>
    </TabListScope>
  );
};
