import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab/components/TabListFromUrlOptionalEffect';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { TabListScope } from '@/ui/layout/tab/scopes/TabListScope';
import { LayoutCard } from '@/ui/layout/tab/types/LayoutCard';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { Tab } from './Tab';
import { MoreTabsDropdown } from './TabMoreDropdown';
import { IconComponent, IconChevronDown } from 'twenty-ui';

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

  const [maxVisibleTabs, setMaxVisibleTabs] = useState<number>(
    visibleTabs.length,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current !== null) {
      const containerWidth = containerRef.current.offsetWidth;
      const firstTab = containerRef.current.querySelector(
        '.tab-item',
      ) as HTMLElement;
      const tabWidth = firstTab.offsetWidth + 16; // 16px := gap between tabs
      const calculatedMaxVisible = Math.floor(containerWidth / tabWidth) - 1; // -1 to make space for the dropdown button
      setMaxVisibleTabs(calculatedMaxVisible);
    }
  }, []);

  const truncatedTabs = visibleTabs.slice(0, maxVisibleTabs);
  const remainingTabs = visibleTabs.slice(maxVisibleTabs);

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
      <StyledContainer className={className} ref={containerRef}>
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
            // Add a class for measurement
            className="tab-item"
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
