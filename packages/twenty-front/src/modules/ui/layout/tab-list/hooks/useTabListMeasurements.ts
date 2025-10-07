import { useCallback, useMemo, useState } from 'react';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { calculateVisibleTabCount } from '@/ui/layout/tab-list/utils/calculateVisibleTabCount';

type Dimensions = {
  width: number;
  height: number;
};

type UseTabListMeasurementsOptions = {
  visibleTabs: SingleTabProps[];
  hasAddButton?: boolean;
};

type UseTabListMeasurementsResult = {
  visibleTabCount: number;
  hiddenTabs: SingleTabProps[];
  hiddenTabsCount: number;
  hasHiddenTabs: boolean;
  onTabWidthChange: (tabId: string) => (dimensions: Dimensions) => void;
  onContainerWidthChange: (dimensions: Dimensions) => void;
  onMoreButtonWidthChange: (dimensions: Dimensions) => void;
  onAddButtonWidthChange: (dimensions: Dimensions) => void;
};

export const useTabListMeasurements = ({
  visibleTabs,
  hasAddButton = false,
}: UseTabListMeasurementsOptions): UseTabListMeasurementsResult => {
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
      addButtonWidth: hasAddButton ? addButtonWidth : 0,
    });
  }, [
    visibleTabs,
    tabWidthsById,
    containerWidth,
    moreButtonWidth,
    addButtonWidth,
    hasAddButton,
  ]);

  const hiddenTabs = useMemo(() => {
    return visibleTabs.slice(visibleTabCount);
  }, [visibleTabs, visibleTabCount]);

  const hiddenTabsCount = hiddenTabs.length;
  const hasHiddenTabs = hiddenTabsCount > 0;

  const onTabWidthChange = useCallback(
    (tabId: string) => (dimensions: Dimensions) => {
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

  const onContainerWidthChange = useCallback((dimensions: Dimensions) => {
    setContainerWidth((prev) => {
      return prev !== dimensions.width ? dimensions.width : prev;
    });
  }, []);

  const onMoreButtonWidthChange = useCallback((dimensions: Dimensions) => {
    setMoreButtonWidth((prev) => {
      return prev !== dimensions.width ? dimensions.width : prev;
    });
  }, []);

  const onAddButtonWidthChange = useCallback((dimensions: Dimensions) => {
    setAddButtonWidth((prev) => {
      return prev !== dimensions.width ? dimensions.width : prev;
    });
  }, []);

  return {
    visibleTabCount,
    hiddenTabs,
    hiddenTabsCount,
    hasHiddenTabs,
    onTabWidthChange,
    onContainerWidthChange,
    onMoreButtonWidthChange,
    onAddButtonWidthChange,
  };
};
