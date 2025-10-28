import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { TabListHiddenMeasurements } from '@/ui/layout/tab-list/components/TabListHiddenMeasurements';
import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabButton } from 'twenty-ui/input';
import { TabListDropdown } from './TabListDropdown';
import { TabListFromUrlOptionalEffect } from './TabListFromUrlOptionalEffect';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  position: relative;
  user-select: none;
  width: 100%;

  &::after {
    background-color: ${({ theme }) => theme.border.color.light};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }
`;

const StyledTabContainer = styled.div`
  display: flex;
  gap: ${TAB_LIST_GAP}px;
  position: relative;
  overflow: hidden;
  max-width: 100%;
`;

export const TabList = ({
  tabs,
  loading,
  behaveAsLinks = true,
  isInRightDrawer,
  className,
  componentInstanceId,
  onChangeTab,
}: TabListProps) => {
  const visibleTabs = tabs.filter((tab) => !tab.hide);
  const navigate = useNavigate();

  const [activeTabId, setActiveTabId] = useRecoilComponentState(
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
          isInRightDrawer={!!isInRightDrawer}
          tabListIds={tabs.map((tab) => tab.id)}
        />

        {visibleTabs.length > 1 && (
          <TabListHiddenMeasurements
            visibleTabs={visibleTabs}
            activeTabId={activeTabId}
            loading={loading}
            onTabWidthChange={onTabWidthChange}
            onMoreButtonWidthChange={onMoreButtonWidthChange}
          />
        )}

        <NodeDimension onDimensionChange={onContainerWidthChange}>
          <StyledContainer className={className}>
            <StyledTabContainer>
              {visibleTabs.slice(0, visibleTabCount).map((tab) => (
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
                  onClick={
                    behaveAsLinks
                      ? () => onChangeTab?.(tab.id)
                      : () => handleTabSelect(tab.id)
                  }
                />
              ))}
            </StyledTabContainer>

            {hasHiddenTabs && (
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
            )}
          </StyledContainer>
        </NodeDimension>
      </>
    </TabListComponentInstanceContext.Provider>
  );
};
