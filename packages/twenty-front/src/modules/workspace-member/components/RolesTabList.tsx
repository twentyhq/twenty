import styled from '@emotion/styled';
import * as React from 'react';

import { Tab } from '@/ui/layout/tab/components/Tab';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { TabListScope } from '@/ui/layout/tab/scopes/TabListScope';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useIcons } from 'twenty-ui';

type TabItemProps = {
  id: string;
  name: string;
  icon: string;
  hide?: boolean;
  disabled?: boolean;
  pill?: string;
};

type RolesTabListProps = {
  tabListId: string;
  tabs: TabItemProps[];
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

export const RolesTabList = ({
  tabs,
  tabListId,
  loading,
  className,
}: RolesTabListProps) => {
  const initialActiveTabId = tabs.find((tab) => !tab.hide)?.id || 0;

  const { activeTabId, setActiveTabId } = useTabList(tabListId);



  React.useEffect(() => {
    setActiveTabId(initialActiveTabId.toString());
  }, [initialActiveTabId, setActiveTabId]);

  const { getIcon } = useIcons();

  return (
    <TabListScope tabListScopeId={tabListId}>
      <ScrollWrapper      
        contextProviderName="tabList"
        componentInstanceId={`scroll-wrapper-tab-list-${tabListId}`}>
        <StyledContainer className={className}>
          {tabs.map((tab) => (
            <Tab
              id={tab.id.toString()}
              key={tab.id}
              title={tab.name}
              Icon={getIcon(tab.icon)}
              active={tab.id.toString() === activeTabId}
              onClick={() => setActiveTabId(tab.id.toString())}
              disabled={loading}
            />
          ))}
        </StyledContainer>
      </ScrollWrapper>
    </TabListScope>
  );
};
