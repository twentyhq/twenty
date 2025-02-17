import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab/components/TabListFromUrlOptionalEffect';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { TabListScope } from '@/ui/layout/tab/scopes/TabListScope';
import { LayoutCard } from '@/ui/layout/tab/types/LayoutCard';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { Tab } from './Tab';
import { MoreTabsDropdown } from './TabMoreDropdown';
import { IconComponent, IconChevronDown } from 'twenty-ui';
import { TAB_CONSTANTS } from '../constants/TabConstants';

const MAX_VISIBLE_TABS = TAB_CONSTANTS.MAX_VISIBLE_TABS;

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
  const visibleTabs = tabs.filter((tab) => !tab.hide);
  const truncatedTabs = visibleTabs.slice(0, MAX_VISIBLE_TABS);
  const remainingTabs = visibleTabs.slice(MAX_VISIBLE_TABS, visibleTabs.length);

  const initialActiveTabId = activeTabId || visibleTabs[0]?.id || '';

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  if (visibleTabs.length <= 1) {
    return null;
  }

  const handleTabClick = (tabId: string) => {
    if (!behaveAsLinks) {
      setActiveTabId(tabId);
    }
  };

  return (
    <TabListScope tabListScopeId={tabListInstanceId}>
      <TabListFromUrlOptionalEffect
        isInRightDrawer={isInRightDrawer}
        componentInstanceId={tabListInstanceId}
        tabListIds={tabs.map((tab) => tab.id)}
      />
      <StyledContainer className={className}>
        {truncatedTabs.map((tab) => (
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
            inDropdown={false}
          />
        ))}
        {remainingTabs.length > 0 && (
          <MoreTabsDropdown
            id="more-button"
            title={`+${remainingTabs.length} More`}
            Icon={IconChevronDown}
            dropdownContent={
              <StyledDropdownContainer>
                {remainingTabs.map((tab) => (
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
                    inDropdown={true}
                  />
                ))}
              </StyledDropdownContainer>
            }
            dropdownPlacement="bottom-start"
          />
        )}
      </StyledContainer>
    </TabListScope>
  );
};
