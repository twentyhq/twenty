import styled from '@emotion/styled';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { IconComponent } from 'twenty-ui';

import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { TabListScope } from '@/ui/layout/tab/scopes/TabListScope';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { Tab } from './Tab';

type SingleTabProps = {
  title: string;
  Icon?: IconComponent;
  id: string;
  hide?: boolean;
  disabled?: boolean;
  pill?: string;
};

type TabListProps = {
  tabListId: string;
  tabs: SingleTabProps[];
  loading?: boolean;
  className?: string;
};

const StyledContainer = styled.div`
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  user-select: none;
`;

export const TabList = ({
  tabs,
  tabListId,
  loading,
  className,
}: TabListProps) => {
  const initialActiveTabId = tabs.find((tab) => !tab.hide)?.id || '';

  const { activeTabIdState, setActiveTabId } = useTabList(tabListId);

  const activeTabId = useRecoilValue(activeTabIdState);

  React.useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  return (
    <TabListScope tabListScopeId={tabListId}>
      <ScrollWrapper enableYScroll={false} contextProviderName="tabList">
        <StyledContainer className={className}>
          {tabs
            .filter((tab) => !tab.hide)
            .map((tab) => (
              <Tab
                id={tab.id}
                key={tab.id}
                title={tab.title}
                Icon={tab.Icon}
                active={tab.id === activeTabId}
                onClick={() => {
                  setActiveTabId(tab.id);
                }}
                disabled={tab.disabled ?? loading}
                pill={tab.pill}
              />
            ))}
        </StyledContainer>
      </ScrollWrapper>
    </TabListScope>
  );
};
