import { type ReactNode } from 'react';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { TabListStateContextProvider } from '../contexts/TabListStateContext';
import { useTabListState } from '../hooks/useTabListState';
import { TabListInitialActiveTabEffect } from './TabListInitialActiveTabEffect';

export type TabListStateProviderProps = {
  visibleTabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks: boolean;
  className?: string;
  componentInstanceId: string;
  onAddTab?: () => void;
  isDraggable?: boolean;
  onDragEnd?: OnDragEndResponder;
  children: ReactNode;
};

export const TabListStateProvider = ({
  visibleTabs,
  loading,
  behaveAsLinks,
  className,
  componentInstanceId,
  onAddTab,
  isDraggable,
  onDragEnd,
  children,
}: TabListStateProviderProps) => {
  const { contextValue, initialActiveTabId, syncActiveTabId } = useTabListState(
    {
      visibleTabs,
      loading,
      behaveAsLinks,
      className,
      componentInstanceId,
      onAddTab,
      isDraggable,
      onDragEnd,
    },
  );

  return (
    <TabListStateContextProvider value={contextValue}>
      <TabListInitialActiveTabEffect
        initialActiveTabId={initialActiveTabId}
        onSyncActiveTabId={syncActiveTabId}
      />
      {children}
    </TabListStateContextProvider>
  );
};
