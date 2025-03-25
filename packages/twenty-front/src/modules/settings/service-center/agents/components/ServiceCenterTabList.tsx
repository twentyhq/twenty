import styled from '@emotion/styled';
import * as React from 'react';

import { Tab } from '@/ui/layout/tab/components/Tab';
import { TabListScope } from '@/ui/layout/tab/scopes/TabListScope';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useTheme } from '@emotion/react';
import { useIcons } from 'twenty-ui';

type TabItemProps = {
  id: string;
  name: string;
  icon: string;
  hide?: boolean;
  disabled?: boolean;
  pill?: string;
};

type ServiceCenterTabListProps = {
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

export const ServiceCenterTabList = ({
  tabs,
  tabListId,
  loading,
  className,
}: ServiceCenterTabListProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();

  const { getIcon } = useIcons();

  const initialActiveTabId = tabs.find((tab) => !tab.hide)?.id || 0;

  const [activeTabId, setActiveTabId] = useRecoilComponentStateV2(
    activeTabIdComponentState,
    tabListId,
  );

  // const activeTabId = useRecoilValue(activeTabIdState);

  React.useEffect(() => {
    setActiveTabId(initialActiveTabId.toString());
  }, [initialActiveTabId, setActiveTabId]);

  return (
    <TabListScope tabListScopeId={tabListId}>
      {/* <ScrollWrapper hideY> */}
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
      {/* </ScrollWrapper> */}
    </TabListScope>
  );
};
