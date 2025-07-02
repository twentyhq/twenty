import styled from '@emotion/styled';

import { DeprecatedTab } from '@/ui/layout/tab/components/Tab';

import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';

type TabItemProps = {
  id: string;
  name: string;
  incomingMessages?: number;
};

type PaneSideTabsProps = {
  tabListId: string;
  tabs: TabItemProps[];
  loading?: boolean;
  className?: string;
};

const StyledContainer = styled.div`
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  user-select: none;
`;

export const PaneSideTabs = ({
  tabs,
  tabListId,
  loading,
  className,
}: PaneSideTabsProps) => {
  const [activeTabId, setActiveTabId] = useRecoilComponentStateV2(
    activeTabIdComponentState,
    tabListId,
  );

  return (
    <TabListComponentInstanceContext.Provider value={{ instanceId: tabListId }}>
      <StyledContainer className={className}>
        {tabs.map((tab) => (
          <DeprecatedTab
            id={tab.id.toString()}
            key={tab.id}
            title={tab.name}
            active={tab.id.toString() === activeTabId}
            onClick={() => setActiveTabId(tab.id)}
            disabled={loading}
            incomingMessages={tab.incomingMessages}
          />
        ))}
      </StyledContainer>
    </TabListComponentInstanceContext.Provider>
  );
};
