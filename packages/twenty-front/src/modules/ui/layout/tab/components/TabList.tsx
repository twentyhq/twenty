import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab/components/TabListFromUrlOptionalEffect';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { TabListScope } from '@/ui/layout/tab/scopes/TabListScope';
import { LayoutCard } from '@/ui/layout/tab/types/LayoutCard';
import styled from '@emotion/styled';
import { useMemo, useEffect } from 'react';
import { Tab } from './Tab';
import { MoreButton } from './TabMoreButton';
import { IconComponent, IconChevronDown } from 'twenty-ui';

const MAX_VISIBLE_TABS = 4;

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

const StyledDropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const TabList = ({
  tabs,
  tabListInstanceId,
  loading = false,
  behaveAsLinks = true,
  isInRightDrawer = false,
  className,
}: TabListProps) => {
  const { activeTabId, setActiveTabId } = useTabList(tabListInstanceId);
  const visibleTabs = useMemo(() => tabs.filter((tab) => !tab.hide), [tabs]);
  const truncatedTabs = useMemo(
    () => visibleTabs.slice(0, MAX_VISIBLE_TABS),
    [visibleTabs],
  );
  const remainingTabs = useMemo(
    () => visibleTabs.slice(MAX_VISIBLE_TABS, visibleTabs.length),
    [visibleTabs],
  );

  const initialActiveTabId = activeTabId || visibleTabs[0]?.id || '';

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, []);

  if (visibleTabs.length <= 1) {
    return null;
  }

  const handleTabClick = (tabId: string) => {
    if (!behaveAsLinks) {
      setActiveTabId(tabId);
    }
  };

  const renderTab = (tab: SingleTabProps, inDropdown = false) => (
    <Tab
      key={tab.id}
      id={tab.id}
      title={tab.title}
      Icon={tab.Icon}
      logo={tab.logo}
      active={tab.id === activeTabId}
      disabled={tab.disabled ?? loading}
      pill={tab.pill}
      to={behaveAsLinks ? `#${tab.id}` : undefined}
      onClick={() => handleTabClick(tab.id)}
      inDropdown={inDropdown}
    />
  );

  return (
    <TabListScope tabListScopeId={tabListInstanceId}>
      <TabListFromUrlOptionalEffect
        isInRightDrawer={isInRightDrawer}
        componentInstanceId={tabListInstanceId}
        tabListIds={tabs.map((tab) => tab.id)}
      />
      <StyledContainer className={className}>
        {truncatedTabs.map((tab) => renderTab(tab))}
        {remainingTabs.length > 0 && (
          <MoreButton
            id="more-button"
            title={`+${remainingTabs.length} More`}
            Icon={IconChevronDown}
            dropdownContent={
              <StyledDropdownContainer>
                {remainingTabs.map((tab) => renderTab(tab, true))}
              </StyledDropdownContainer>
            }
            dropdownPlacement="bottom-start"
          />
        )}
      </StyledContainer>
    </TabListScope>
  );
};
