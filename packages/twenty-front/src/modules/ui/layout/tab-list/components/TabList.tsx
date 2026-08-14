import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TabListHiddenMeasurements } from '@/ui/layout/tab-list/components/TabListHiddenMeasurements';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { useScrollActiveTabIntoView } from '@/ui/layout/tab-list/hooks/useScrollActiveTabIntoView';
import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { SCROLLABLE_TAB_ROW_CSS } from '@/ui/layout/tab-list/styles/ScrollableTabRowCSS';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { TabButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { TabListDropdown } from './TabListDropdown';
import { TabListFromUrlOptionalEffect } from './TabListFromUrlOptionalEffect';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  height: ${TAB_LIST_HEIGHT};
  position: relative;
  user-select: none;
  width: 100%;

  &::after {
    background-color: ${themeCssVariables.border.color.light};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }
`;

const StyledInnerContainer = styled.div<{ $centerTabs: boolean }>`
  display: flex;
  flex: 1;
  justify-content: ${({ $centerTabs }) =>
    $centerTabs ? 'center' : 'flex-start'};
  min-width: 0;
`;

const StyledDropdownContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledTabContainer = styled.div<{ isScrollable: boolean }>`
  display: flex;
  gap: ${TAB_LIST_GAP}px;
  max-width: 100%;
  overflow-x: ${({ isScrollable }) => (isScrollable ? 'auto' : 'hidden')};
  position: relative;
  ${SCROLLABLE_TAB_ROW_CSS}
`;

const StyledNodeDimension = styled(NodeDimension)`
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: auto;
`;

export const TabList = ({
  tabs,
  loading,
  behaveAsLinks = true,
  isInSidePanel,
  className,
  componentInstanceId,
  onChangeTab,
  rightComponent,
  centerTabs = false,
}: TabListProps) => {
  const visibleTabs = tabs.filter((tab) => !tab.hide);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

  const {
    visibleTabCount,
    hiddenTabs,
    hiddenTabsCount,
    hasHiddenTabs,
    onTabWidthChange,
    onContainerWidthChange,
    onMoreButtonWidthChange,
  } = useTabListMeasurements({
    visibleTabs,
    hasAddButton: false,
  });

  const shouldScrollTabs = isMobile;
  const renderedTabs = shouldScrollTabs
    ? visibleTabs
    : visibleTabs.slice(0, visibleTabCount);
  const shouldShowOverflowDropdown = hasHiddenTabs && !shouldScrollTabs;

  const { tabRowRef } = useScrollActiveTabIntoView({
    activeTabId,
    isScrollable: shouldScrollTabs,
  });

  const dropdownId = `tab-overflow-${componentInstanceId}`;
  const { closeDropdown } = useCloseDropdown();

  const isActiveTabHidden = useMemo(() => {
    if (!hasHiddenTabs) return false;
    return hiddenTabs.some((tab) => tab.id === activeTabId);
  }, [hasHiddenTabs, hiddenTabs, activeTabId]);

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
    onChangeTab?.(initialActiveTabId || '');
  }, [initialActiveTabId, setActiveTabId, onChangeTab]);

  const handleTabSelect = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
      onChangeTab?.(tabId);
    },
    [setActiveTabId, onChangeTab],
  );

  const handleTabSelectFromDropdown = useCallback(
    (tabId: string) => {
      if (behaveAsLinks) {
        navigate(`#${tabId}`);
        onChangeTab?.(tabId);
      } else {
        handleTabSelect(tabId);
      }
    },
    [behaveAsLinks, handleTabSelect, navigate, onChangeTab],
  );

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <>
        <TabListFromUrlOptionalEffect
          isInSidePanel={!!isInSidePanel}
          tabListIds={tabs.map((tab) => tab.id)}
        />

        {visibleTabs.length > 1 && !shouldScrollTabs && (
          <TabListHiddenMeasurements
            visibleTabs={visibleTabs}
            activeTabId={activeTabId}
            loading={loading}
            onTabWidthChange={onTabWidthChange}
            onMoreButtonWidthChange={onMoreButtonWidthChange}
          />
        )}

        <StyledContainer className={className}>
          <StyledNodeDimension onDimensionChange={onContainerWidthChange}>
            <StyledInnerContainer $centerTabs={centerTabs && !shouldScrollTabs}>
              <StyledTabContainer
                ref={tabRowRef}
                isScrollable={shouldScrollTabs}
              >
                {renderedTabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    id={tab.id}
                    title={tab.title}
                    LeftIcon={tab.Icon}
                    logo={tab.logo}
                    active={tab.id === activeTabId}
                    disabled={tab.disabled ?? loading}
                    pill={tab.pill}
                    to={behaveAsLinks ? `#${tab.id}` : undefined}
                    tooltipContent={tab.tooltipContent}
                    onClick={
                      behaveAsLinks
                        ? () => onChangeTab?.(tab.id)
                        : () => handleTabSelect(tab.id)
                    }
                  />
                ))}
              </StyledTabContainer>

              {shouldShowOverflowDropdown && (
                <StyledDropdownContainer>
                  <TabListDropdown
                    dropdownId={dropdownId}
                    onClose={() => {
                      closeDropdown(dropdownId);
                    }}
                    overflow={{
                      hiddenTabsCount,
                      isActiveTabHidden,
                    }}
                    hiddenTabs={hiddenTabs}
                    activeTabId={activeTabId || ''}
                    onTabSelect={handleTabSelectFromDropdown}
                    loading={loading}
                  />
                </StyledDropdownContainer>
              )}
            </StyledInnerContainer>
          </StyledNodeDimension>

          {isDefined(rightComponent) && (
            <StyledRightContainer>{rightComponent}</StyledRightContainer>
          )}
        </StyledContainer>
      </>
    </TabListComponentInstanceContext.Provider>
  );
};
