import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { calculateVisibleTabCount } from '@/ui/layout/tab-list/utils/calculateVisibleTabCount';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { activeTabIdComponentState } from '../states/activeTabIdComponentState';
import { type TabListStateContextValue } from '../contexts/TabListStateContext';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { type OnDragEndResponder } from '@hello-pangea/dnd';

export type UseTabListStateArgs = {
  visibleTabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks: boolean;
  className?: string;
  componentInstanceId: string;
  onAddTab?: () => void;
  isDraggable?: boolean;
  onDragEnd?: OnDragEndResponder;
};

export type UseTabListStateResult = {
  contextValue: TabListStateContextValue;
  initialActiveTabId: string | null;
  syncActiveTabId: (tabId: string | null) => void;
};

export const useTabListState = ({
  visibleTabs,
  loading,
  behaveAsLinks,
  className,
  componentInstanceId,
  onAddTab,
  isDraggable,
  onDragEnd,
}: UseTabListStateArgs): UseTabListStateResult => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const [tabWidthsById, setTabWidthsById] = useState<TabWidthsById>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [moreButtonWidth, setMoreButtonWidth] = useState(0);
  const [addButtonWidth, setAddButtonWidth] = useState(0);

  const visibleTabCount = useMemo(() => {
    return calculateVisibleTabCount({
      visibleTabs,
      tabWidthsById,
      containerWidth,
      moreButtonWidth,
      addButtonWidth: onAddTab ? addButtonWidth : 0,
    });
  }, [
    visibleTabs,
    tabWidthsById,
    containerWidth,
    moreButtonWidth,
    addButtonWidth,
    onAddTab,
  ]);

  const hiddenTabs = visibleTabs.slice(visibleTabCount);
  const hiddenTabsCount = hiddenTabs.length;
  const hasHiddenTabs = hiddenTabsCount > 0;
  const isActiveTabHidden =
    activeTabId !== null && hiddenTabs.some((tab) => tab.id === activeTabId);

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
        return;
      }

      handleTabSelect(tabId);
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

  const handleContainerWidthChange = useCallback(
    (dimensions: { width: number; height: number }) => {
      setContainerWidth((prev) => {
        return prev !== dimensions.width ? dimensions.width : prev;
      });
    },
    [],
  );

  const isDragAndDropEnabled = isDraggable === true && onDragEnd !== undefined;

  const dropdownId = `tab-overflow-${componentInstanceId}`;

  const initialActiveTabId = (() => {
    if (visibleTabs.length === 0) {
      return null;
    }

    const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
    return activeTabExists ? activeTabId : (visibleTabs[0]?.id ?? null);
  })();

  const contextValue: TabListStateContextValue = {
    visibleTabs,
    visibleTabCount,
    hiddenTabs,
    hiddenTabsCount,
    hasHiddenTabs,
    overflow: {
      hiddenTabsCount,
      isActiveTabHidden,
    },
    activeTabId,
    loading,
    behaveAsLinks,
    className,
    dropdownId,
    onAddTab,
    onTabSelect: handleTabSelect,
    onTabSelectFromDropdown: handleTabSelectFromDropdown,
    onContainerWidthChange: handleContainerWidthChange,
    onTabWidthChange: handleTabWidthChange,
    onMoreButtonWidthChange: handleMoreButtonWidthChange,
    onAddButtonWidthChange: handleAddButtonWidthChange,
    isDragAndDropEnabled,
    onDragEnd,
  };

  return {
    contextValue,
    initialActiveTabId,
    syncActiveTabId: setActiveTabId,
  };
};
