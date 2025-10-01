import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { useMemo } from 'react';
import { TabListContent } from './TabListContent';
import { TabListFromUrlOptionalEffect } from './TabListFromUrlOptionalEffect';
import { TabListMeasurements } from './TabListMeasurements';
import { TabListStateProvider } from './TabListStateProvider';

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
  const visibleTabs = useMemo(() => {
    return tabs.filter((tab) => !tab.hide);
  }, [tabs]);

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

      <TabListStateProvider
        visibleTabs={visibleTabs}
        loading={loading}
        behaveAsLinks={behaveAsLinks}
        className={className}
        componentInstanceId={componentInstanceId}
        onAddTab={onAddTab}
        isDraggable={isDraggable}
        onDragEnd={onDragEnd}
      >
        <TabListMeasurements />
        <TabListContent />
      </TabListStateProvider>
    </TabListComponentInstanceContext.Provider>
  );
};
