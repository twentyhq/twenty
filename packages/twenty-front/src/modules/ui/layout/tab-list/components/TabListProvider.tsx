import { type ReactNode } from 'react';

import { TabListInitialActiveTabEffect } from '@/ui/layout/tab-list/components/TabListInitialActiveTabEffect';
import { TabListContextProvider } from '@/ui/layout/tab-list/contexts/TabListContext';
import { useTabList } from '@/ui/layout/tab-list/hooks/useTabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { type TabActions } from '@/ui/layout/tab-list/types/TabActions';

export type TabListProviderProps = {
  visibleTabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks: boolean;
  className?: string;
  componentInstanceId: string;
  onChangeTab?: (tabId: string) => void;
  onAddTab?: () => void;
  isDraggable?: boolean;
  onDragEnd?: OnDragEndResponder;
  tabActions?: TabActions;
  children: ReactNode;
};

export const TabListProvider = ({
  visibleTabs,
  loading,
  behaveAsLinks,
  className,
  componentInstanceId,
  onChangeTab,
  onAddTab,
  isDraggable,
  onDragEnd,
  tabActions,
  children,
}: TabListProviderProps) => {
  const {
    contextValue,
    initialActiveTabId,
    syncActiveTabId,
    onChangeTab: onChangeTabCallback,
  } = useTabList({
    visibleTabs,
    loading,
    behaveAsLinks,
    className,
    componentInstanceId,
    onChangeTab,
    onAddTab,
    isDraggable,
    onDragEnd,
    tabActions,
  });

  return (
    <TabListContextProvider value={contextValue}>
      <TabListInitialActiveTabEffect
        initialActiveTabId={initialActiveTabId}
        onSyncActiveTabId={syncActiveTabId}
        onChangeTab={onChangeTabCallback}
      />
      {children}
    </TabListContextProvider>
  );
};
