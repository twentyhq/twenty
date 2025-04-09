import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab/components/TabListFromUrlOptionalEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab/states/contexts/TabListComponentInstanceContext';
import { LayoutCard } from '@/ui/layout/tab/types/LayoutCard';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import styled from '@emotion/styled';
import * as React from 'react';
import { useEffect } from 'react';
import { IconComponent } from 'twenty-ui/display';
import { Tab } from './Tab';

export type SingleTabProps<T extends string = string> = {
  title: string;
  Icon?: IconComponent;
  id: T;
  hide?: boolean;
  disabled?: boolean;
  pill?: string | React.ReactElement;
  cards?: LayoutCard[];
  logo?: string;
};

type TabListProps = {
  tabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks?: boolean;
  className?: string;
  isInRightDrawer?: boolean;
  componentInstanceId: string;
};

const StyledContainer = styled.div`
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 40px;
  user-select: none;
  width: 100%;
`;

const StyledOuterContainer = styled.div`
  width: 100%;
`;

export const TabList = ({
  tabs,
  loading,
  behaveAsLinks = true,
  isInRightDrawer,
  className,
  componentInstanceId,
}: TabListProps) => {
  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const [activeTabId, setActiveTabId] = useRecoilComponentStateV2(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const initialActiveTabId = activeTabId || visibleTabs[0]?.id || '';

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  if (visibleTabs.length <= 1) {
    return null;
  }

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <StyledOuterContainer>
        <TabListFromUrlOptionalEffect
          isInRightDrawer={!!isInRightDrawer}
          tabListIds={tabs.map((tab) => tab.id)}
        />
        <ScrollWrapper
          defaultEnableYScroll={false}
          componentInstanceId={`scroll-wrapper-tab-list-${componentInstanceId}`}
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
      </StyledOuterContainer>
    </TabListComponentInstanceContext.Provider>
  );
};
