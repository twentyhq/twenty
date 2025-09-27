import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { calculateVisibleTabCount } from '@/ui/layout/tab-list/utils/calculateVisibleTabCount';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabListContent } from './TabListContent';
import { TabListFromUrlOptionalEffect } from './TabListFromUrlOptionalEffect';
import { TabListMeasurements } from './TabListMeasurements';

export const TabList = ({
  tabs,
  loading,
  behaveAsLinks = true,
  isInRightDrawer,
  className,
  componentInstanceId,
  onAddTab,
  isDraggable,
  onDragEnd,
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
  const [addButtonWidth, setAddButtonWidth] = useState(0);

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  const visibleTabCount = useMemo(() => {
    return calculateVisibleTabCount({
      visibleTabs,
      tabWidthsById,
      containerWidth,
      moreButtonWidth,
      addButtonWidth: onAddTab ? addButtonWidth : 0,
    });
  }, [
    tabWidthsById,
    containerWidth,
    moreButtonWidth,
    addButtonWidth,
    visibleTabs,
    onAddTab,
  ]);

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

  const handleAddButtonWidthChange = useCallback(
    (dimensions: { width: number; height: number }) => {
      setAddButtonWidth((prev) => {
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
      <TabListFromUrlOptionalEffect
        isInRightDrawer={!!isInRightDrawer}
        tabListIds={tabs.map((tab) => tab.id)}
      />

      <TabListMeasurements
        visibleTabs={visibleTabs}
        activeTabId={activeTabId}
        loading={loading}
        onAddTab={onAddTab}
        onTabWidthChange={handleTabWidthChange}
        onMoreButtonWidthChange={handleMoreButtonWidthChange}
        onAddButtonWidthChange={handleAddButtonWidthChange}
      />

      <TabListContent
        visibleTabs={visibleTabs}
        visibleTabCount={visibleTabCount}
        activeTabId={activeTabId}
        loading={loading}
        isDraggable={isDraggable}
        behaveAsLinks={behaveAsLinks}
        className={className}
        componentInstanceId={componentInstanceId}
        onAddTab={onAddTab}
        onTabSelect={handleTabSelect}
        onTabSelectFromDropdown={handleTabSelectFromDropdown}
        onContainerWidthChange={handleContainerWidthChange}
        onDragEnd={onDragEnd}
      />
    </TabListComponentInstanceContext.Provider>
  );
};
