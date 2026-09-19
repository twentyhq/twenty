import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TabListHiddenMeasurements } from '@/ui/layout/tab-list/components/TabListHiddenMeasurements';
import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { useScrollActiveTabIntoView } from '@/ui/layout/tab-list/hooks/useScrollActiveTabIntoView';
import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { TabListRow } from '@/ui/layout/tab-list/components/TabListRow';
import { TabListItem } from '@/ui/layout/tab-list/components/TabListItem';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { TabListDropdown } from './TabListDropdown';
import { TabListSelectionSyncEffect } from '@/ui/layout/tab-list/components/TabListSelectionSyncEffect';

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
  'aria-label': ariaLabel,
  tabs,
  loading,
  behaveAsLinks = true,
  className,
  componentInstanceId,
  onChangeTab,
  rightComponent,
  centerTabs = false,
  alwaysScrollTabs = false,
}: TabListProps) => {
  const visibleTabs = tabs.filter((tab) => !tab.hide);
  const location = useLocation();
  const navigate = useNavigate();
  const workspaceSurface = useWorkspaceSurface();
  const isMobile = useIsMobile();

  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const routeTabId = location.hash.replace('#', '');
  const shouldSelectRouteTab =
    behaveAsLinks &&
    workspaceSurface.ownsRouteLocation &&
    visibleTabs.some((tab) => tab.id === routeTabId);
  const nextActiveTabId = shouldSelectRouteTab
    ? routeTabId
    : activeTabExists
      ? activeTabId
      : (visibleTabs[0]?.id ?? null);

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

  const shouldScrollTabs = isMobile || alwaysScrollTabs;
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

  const handleTabSelect = useCallback(
    (tabId: string) => {
      if (tabId === activeTabId) {
        return;
      }

      setActiveTabId(tabId);
      onChangeTab?.(tabId);
    },
    [activeTabId, setActiveTabId, onChangeTab],
  );

  const handleTabSelectFromDropdown = useCallback(
    (tabId: string) => {
      if (behaveAsLinks) {
        navigate(
          { search: location.search, hash: `#${tabId}` },
          {
            replace: workspaceSurface.type === 'side-panel',
            state: location.state,
          },
        );
      }

      handleTabSelect(tabId);
    },
    [
      behaveAsLinks,
      handleTabSelect,
      location.search,
      location.state,
      navigate,
      workspaceSurface.type,
    ],
  );

  if (visibleTabs.length === 0) {
    return (
      <TabListSelectionSyncEffect
        componentInstanceId={componentInstanceId}
        nextActiveTabId={null}
        onChangeTab={onChangeTab}
      />
    );
  }

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <>
        <TabListSelectionSyncEffect
          componentInstanceId={componentInstanceId}
          nextActiveTabId={nextActiveTabId}
          onChangeTab={onChangeTab}
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
              <TabListRow
                aria-label={ariaLabel}
                ref={tabRowRef}
                behaveAsLinks={behaveAsLinks}
                isScrollable={shouldScrollTabs}
              >
                {renderedTabs.map((tab) => (
                  <TabListItem
                    key={tab.id}
                    tab={tab}
                    mode={behaveAsLinks ? 'link' : 'tab'}
                    active={tab.id === activeTabId}
                    disabled={tab.disabled ?? loading}
                    onSelect={handleTabSelect}
                  />
                ))}
              </TabListRow>

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
