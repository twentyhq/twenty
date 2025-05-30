import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab/components/TabListFromUrlOptionalEffect';
import { TabMoreButton } from '@/ui/layout/tab/components/TabMoreButton';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab/states/contexts/TabListComponentInstanceContext';
import { LayoutCard } from '@/ui/layout/tab/types/LayoutCard';
import { isFirstOverflowingTab } from '@/ui/layout/tab/utils/isFirstOverflowingTab';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import styled from '@emotion/styled';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconComponent } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
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
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 40px;
  user-select: none;
  width: 100%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.border.color.light};
  }
`;

const StyledTabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
  overflow: hidden;
  max-width: 100%;
  flex: 1;
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
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useRecoilComponentStateV2(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const [tabContainerElement, setTabContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [previousContainerWidth, setPreviousContainerWidth] = useState(
    tabContainerElement?.clientWidth ?? 0,
  );
  const [firstHiddenTabIndex, setFirstHiddenTabIndex] = useState(
    visibleTabs.length,
  );

  const initialActiveTabId = activeTabId || visibleTabs[0]?.id || '';
  const hiddenTabsCount = visibleTabs.length - firstHiddenTabIndex;
  const hasHiddenTabs = hiddenTabsCount > 0;
  const dropdownId = `tab-overflow-${componentInstanceId}`;

  const isActiveTabHidden = useMemo(() => {
    if (!hasHiddenTabs) return false;

    const hiddenTabs = visibleTabs.slice(firstHiddenTabIndex);
    const result = hiddenTabs.some((tab) => tab.id === activeTabId);

    return result;
  }, [visibleTabs, firstHiddenTabIndex, activeTabId, hasHiddenTabs]);

  const { closeDropdown } = useDropdown(dropdownId);

  const resetFirstHiddenTabIndex = useCallback(() => {
    setFirstHiddenTabIndex(visibleTabs.length);
  }, [visibleTabs.length]);

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  useEffect(() => {
    resetFirstHiddenTabIndex();
  }, [visibleTabs.length, resetFirstHiddenTabIndex]);

  const handleTabSelect = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
    },
    [setActiveTabId],
  );

  const handleDropdownClose = useCallback(() => {
    if (tabContainerElement?.clientWidth !== previousContainerWidth) {
      resetFirstHiddenTabIndex();
      setPreviousContainerWidth(tabContainerElement?.clientWidth ?? 0);
    }
  }, [
    tabContainerElement?.clientWidth,
    previousContainerWidth,
    resetFirstHiddenTabIndex,
  ]);

  const handleTabSelectFromDropdown = useCallback(
    (tabId: string) => {
      if (behaveAsLinks) {
        navigate(`#${tabId}`);
      } else {
        handleTabSelect(tabId);
      }
      closeDropdown();
    },
    [behaveAsLinks, handleTabSelect, closeDropdown, navigate],
  );

  if (visibleTabs.length <= 1) {
    return null;
  }

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <>
        <TabListFromUrlOptionalEffect
          isInRightDrawer={!!isInRightDrawer}
          tabListIds={tabs.map((tab) => tab.id)}
        />
        <StyledContainer className={className}>
          <StyledTabContainer ref={setTabContainerElement}>
            {visibleTabs.slice(0, firstHiddenTabIndex).map((tab, index) => (
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
                onClick={
                  behaveAsLinks ? undefined : () => handleTabSelect(tab.id)
                }
                ref={(tabElement: HTMLButtonElement | null) => {
                  if (
                    index > 0 &&
                    isFirstOverflowingTab({
                      containerElement: tabContainerElement,
                      tabElement,
                    })
                  ) {
                    setFirstHiddenTabIndex(index);
                  }
                }}
              />
            ))}
          </StyledTabContainer>

          {hasHiddenTabs && (
            <Dropdown
              dropdownId={dropdownId}
              dropdownPlacement="bottom-end"
              onClickOutside={handleDropdownClose}
              dropdownOffset={{ x: 0, y: 8 }}
              clickableComponent={
                <TabMoreButton
                  hiddenTabsCount={hiddenTabsCount}
                  active={isActiveTabHidden}
                />
              }
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    {visibleTabs.slice(firstHiddenTabIndex).map((tab) => (
                      <MenuItemSelect
                        key={tab.id}
                        text={tab.title}
                        LeftIcon={tab.Icon}
                        selected={tab.id === activeTabId}
                        onClick={() => handleTabSelectFromDropdown(tab.id)}
                        disabled={tab.disabled ?? loading}
                      />
                    ))}
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
              dropdownHotkeyScope={{ scope: dropdownId }}
            />
          )}
        </StyledContainer>
      </>
    </TabListComponentInstanceContext.Provider>
  );
};
