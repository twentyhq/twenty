import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab/components/TabListFromUrlOptionalEffect';
import { TabMoreButton } from '@/ui/layout/tab/components/TabMoreButton';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab/states/contexts/TabListComponentInstanceContext';
import { LayoutCard } from '@/ui/layout/tab/types/LayoutCard';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import styled from '@emotion/styled';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { IconComponent } from 'twenty-ui/display';
import { Tab } from './Tab';
import { TabListDropdown } from './TabListDropdown';

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
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 40px;
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
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
  overflow: hidden;
  max-width: 100%;
`;

const StyledHiddenMeasurement = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  pointer-events: none;
  position: absolute;
  top: -9999px;
  visibility: hidden;
`;

// TODO: Move these to a shared file
// but before that, this would be optional because the padding is being set in the parent component, not just when in right drawer
const GAP_WIDTH = 4;
const LEFT_PADDING = 8;
const RIGHT_PADDING = 8;

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

  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [moreButtonWidth, setMoreButtonWidth] = useState(0);

  const initialActiveTabId = activeTabId || visibleTabs[0]?.id || '';

  const visibleTabCount = useMemo(() => {
    if (tabWidths.length === 0 || containerWidth === 0) {
      return visibleTabs.length;
    }

    const availableWidth = containerWidth - LEFT_PADDING - RIGHT_PADDING;

    let totalWidth = 0;
    for (let i = 0; i < tabWidths.length; i++) {
      const tabWidth = tabWidths[i];
      const gapsWidth = i > 0 ? GAP_WIDTH : 0;
      const potentialMoreButtonWidth =
        i < tabWidths.length - 1 ? moreButtonWidth + GAP_WIDTH : 0;

      totalWidth += tabWidth + gapsWidth;

      if (totalWidth + potentialMoreButtonWidth > availableWidth) {
        return Math.max(1, i);
      }
    }
    return visibleTabs.length;
  }, [tabWidths, containerWidth, moreButtonWidth, visibleTabs.length]);

  const hiddenTabsCount = visibleTabs.length - visibleTabCount;
  const hasHiddenTabs = hiddenTabsCount > 0;
  const dropdownId = `tab-overflow-${componentInstanceId}`;
  const { closeDropdown } = useDropdown(dropdownId);

  const isActiveTabHidden = useMemo(() => {
    if (!hasHiddenTabs) return false;
    const hiddenTabs = visibleTabs.slice(visibleTabCount);
    return hiddenTabs.some((tab) => tab.id === activeTabId);
  }, [visibleTabs, visibleTabCount, activeTabId, hasHiddenTabs]);

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
    (index: number) => (dimensions: { width: number; height: number }) => {
      setTabWidths((prev) => {
        const newWidths = [...prev];

        if (newWidths[index] !== dimensions.width) {
          newWidths[index] = dimensions.width;
          return newWidths;
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

        {visibleTabs.length > 1 &&
          createPortal(
            <StyledHiddenMeasurement aria-hidden="true">
              {visibleTabs.map((tab, index) => (
                <NodeDimension
                  key={tab.id}
                  onDimensionChange={handleTabWidthChange(index)}
                >
                  <Tab
                    id={tab.id}
                    title={tab.title}
                    Icon={tab.Icon}
                    logo={tab.logo}
                    active={tab.id === activeTabId}
                    disabled={tab.disabled ?? loading}
                    pill={tab.pill}
                  />
                </NodeDimension>
              ))}

              <NodeDimension onDimensionChange={handleMoreButtonWidthChange}>
                <TabMoreButton hiddenTabsCount={1} active={false} />
              </NodeDimension>
            </StyledHiddenMeasurement>,
            document.body,
          )}

        <NodeDimension onDimensionChange={handleContainerWidthChange}>
          <StyledContainer className={className}>
            <StyledTabContainer>
              {visibleTabs.slice(0, visibleTabCount).map((tab) => (
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
                />
              ))}
            </StyledTabContainer>

            {hasHiddenTabs && (
              <TabListDropdown
                dropdownId={dropdownId}
                onClose={() => {
                  closeDropdown();
                }}
                overflow={{
                  hiddenTabsCount,
                  isActiveTabHidden,
                  firstHiddenTabIndex: visibleTabCount,
                }}
                tabs={{
                  visible: visibleTabs,
                  activeId: activeTabId,
                }}
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
