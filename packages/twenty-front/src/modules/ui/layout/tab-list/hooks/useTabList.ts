import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type TabListContextValue } from '@/ui/layout/tab-list/contexts/TabListContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { calculateVisibleTabCount } from '@/ui/layout/tab-list/utils/calculateVisibleTabCount';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { type TabActions } from '@/ui/layout/tab-list/types/TabActions';

export type UseTabListProps = {
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
};

export type UseTabListResult = {
  contextValue: TabListContextValue;
  initialActiveTabId: string | null;
  syncActiveTabId: (tabId: string | null) => void;
  onChangeTab?: (tabId: string) => void;
};

export const useTabList = ({
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
}: UseTabListProps): UseTabListResult => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const [tabWidthsById, setTabWidthsById] = useState<TabWidthsById>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [moreButtonWidth, setMoreButtonWidth] = useState(0);
  const [addButtonWidth, setAddButtonWidth] = useState(0);
  const [tabInRenameMode, setTabInRenameMode] = useState<string | null>(null);

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

  const overflowingTabs = visibleTabs.slice(visibleTabCount);
  const overflowCount = overflowingTabs.length;
  const hasOverflowingTabs = overflowCount > 0;
  const isActiveTabInOverflow =
    activeTabId !== null &&
    overflowingTabs.some((tab) => tab.id === activeTabId);

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
        return;
      }

      handleTabSelect(tabId);
    },
    [behaveAsLinks, handleTabSelect, navigate, onChangeTab],
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

  const handleEnterRenameMode = useCallback((tabId: string) => {
    setTabInRenameMode(tabId);
  }, []);

  const handleExitRenameMode = useCallback(() => {
    setTabInRenameMode(null);
  }, []);

  const initialActiveTabId = (() => {
    if (visibleTabs.length === 0) {
      return null;
    }

    const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
    return activeTabExists ? activeTabId : (visibleTabs[0]?.id ?? null);
  })();

  const contextValue: TabListContextValue = {
    visibleTabs,
    visibleTabCount,
    overflowingTabs,
    overflowCount,
    hasOverflowingTabs,
    overflow: {
      overflowCount,
      isActiveTabInOverflow,
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
    tabActions,
    tabInRenameMode,
    onEnterRenameMode: handleEnterRenameMode,
    onExitRenameMode: handleExitRenameMode,
  };

  return {
    contextValue,
    initialActiveTabId,
    syncActiveTabId: setActiveTabId,
    onChangeTab,
  };
};
