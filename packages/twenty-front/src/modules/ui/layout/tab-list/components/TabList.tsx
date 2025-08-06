import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { calculateVisibleTabCount } from '@/ui/layout/tab-list/utils/calculateVisibleTabCount';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabButton } from 'twenty-ui/input';
import { TabListDropdown } from './TabListDropdown';
import { TabListFromUrlOptionalEffect } from './TabListFromUrlOptionalEffect';
import { TabMoreButton } from './TabMoreButton';

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

const StyledHiddenMeasurement = styled.div`
  display: flex;
  gap: ${TAB_LIST_GAP}px;
  pointer-events: none;
  position: absolute;
  top: -9999px;
  visibility: hidden;
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

  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const [tabWidthsById, setTabWidthsById] = useState<TabWidthsById>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [moreButtonWidth, setMoreButtonWidth] = useState(0);

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

  const visibleTabCount = useMemo(() => {
    return calculateVisibleTabCount({
      visibleTabs,
      tabWidthsById,
      containerWidth,
      moreButtonWidth,
    });
  }, [tabWidthsById, containerWidth, moreButtonWidth, visibleTabs]);

  const hiddenTabsCount = visibleTabs.length - visibleTabCount;
  const hasHiddenTabs = hiddenTabsCount > 0;

  const dropdownId = `tab-overflow-${componentInstanceId}`;
  const { closeDropdown } = useCloseDropdown();

  const isActiveTabHidden = useMemo(() => {
    if (!hasHiddenTabs) return false;
    const hiddenTabs = visibleTabs.slice(visibleTabCount);
    return hiddenTabs.some((tab) => tab.id === activeTabId);
  }, [hasHiddenTabs, visibleTabs, visibleTabCount, activeTabId]);

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  const handleTabSelect = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
    },
    [setActiveTabId],
  );

  const handleTabSelectFromDropdown = useCallback(
    (tabId: string) => {
      if (behaveAsLinks) {
        navigate(`#${tabId}`);
      } else {
        handleTabSelect(tabId);
      }
    },
    [behaveAsLinks, handleTabSelect, navigate],
  );

  const handleTabWidthChange = useCallback(
    (tabId: string) => (dimensions: { width: number; height: number }) => {
      setTabWidthsById((prev) => {
        if (prev[tabId] !== dimensions.width) {
          return {
            ...prev,
            [tabId]: dimensions.width,
          };
        }
        return prev;
      });
    },
    [],
  );

  const handleContainerWidthChange = useCallback(
    (dimensions: { width: number; height: number }) => {
      setContainerWidth((prev) => {
        return prev !== dimensions.width ? dimensions.width : prev;
      });
    },
    [],
  );

  const handleMoreButtonWidthChange = useCallback(
    (dimensions: { width: number; height: number }) => {
      setMoreButtonWidth((prev) => {
        return prev !== dimensions.width ? dimensions.width : prev;
      });
    },
    [],
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
          <StyledHiddenMeasurement>
            {visibleTabs.map((tab) => (
              <NodeDimension
                key={tab.id}
                onDimensionChange={handleTabWidthChange(tab.id)}
              >
                <TabButton
                  id={tab.id}
                  title={tab.title}
                  LeftIcon={tab.Icon}
                  logo={tab.logo}
                  active={tab.id === activeTabId}
                  disabled={tab.disabled ?? loading}
                  pill={tab.pill}
                  disableTestId={true}
                />
              </NodeDimension>
            ))}

            <NodeDimension onDimensionChange={handleMoreButtonWidthChange}>
              <TabMoreButton hiddenTabsCount={1} active={false} />
            </NodeDimension>
          </StyledHiddenMeasurement>
        )}

        <NodeDimension onDimensionChange={handleContainerWidthChange}>
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
                    behaveAsLinks ? undefined : () => handleTabSelect(tab.id)
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
                hiddenTabs={visibleTabs.slice(visibleTabCount)}
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
