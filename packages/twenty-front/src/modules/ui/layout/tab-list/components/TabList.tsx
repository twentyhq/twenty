import { TabListContent } from '@/ui/layout/tab-list/components/TabListContent';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { TabListMeasurements } from '@/ui/layout/tab-list/components/TabListMeasurements';
import { TabListProvider } from '@/ui/layout/tab-list/components/TabListProvider';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { useMemo } from 'react';

export const TabList = ({
  tabs,
  loading,
  behaveAsLinks = true,
  isInRightDrawer,
  className,
  componentInstanceId,
  onChangeTab,
  onAddTab,
  isDraggable,
  onDragEnd,
  tabActions,
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

      <TabListProvider
        visibleTabs={visibleTabs}
        loading={loading}
        behaveAsLinks={behaveAsLinks}
        className={className}
        componentInstanceId={componentInstanceId}
        onChangeTab={onChangeTab}
        onAddTab={onAddTab}
        isDraggable={isDraggable}
        onDragEnd={onDragEnd}
        tabActions={tabActions}
      >
        <TabListMeasurements />
        <TabListContent />
      </TabListProvider>
    </TabListComponentInstanceContext.Provider>
  );
};
