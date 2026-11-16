import { useCallback, useMemo, useState } from 'react';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabListDimensions } from '@/ui/layout/tab-list/types/TabListDimension';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { calculateVisibleTabCount } from '@/ui/layout/tab-list/utils/calculateVisibleTabCount';

type UseTabListMeasurementsOptions<TTab extends Pick<SingleTabProps, 'id'>> = {
  visibleTabs: TTab[];
  hasAddButton?: boolean;
  rightPadding?: number;
  horizontalPadding?: number;
};

type UseTabListMeasurementsResult<TTab extends Pick<SingleTabProps, 'id'>> = {
  visibleTabCount: number;
  hiddenTabs: TTab[];
  hiddenTabsCount: number;
  hasHiddenTabs: boolean;
  onTabWidthChange: (tabId: string) => (dimensions: TabListDimensions) => void;
  onContainerWidthChange: (dimensions: TabListDimensions) => void;
  onMoreButtonWidthChange: (dimensions: TabListDimensions) => void;
  onAddButtonWidthChange: (dimensions: TabListDimensions) => void;
};

export const useTabListMeasurements = <
  TTab extends Pick<SingleTabProps, 'id'>,
>({
  visibleTabs,
  hasAddButton = false,
  rightPadding = 0,
  horizontalPadding,
}: UseTabListMeasurementsOptions<TTab>): UseTabListMeasurementsResult<TTab> => {
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
      rightPadding,
      horizontalPadding,
    });
  }, [
    visibleTabs,
    tabWidthsById,
    containerWidth,
    moreButtonWidth,
    addButtonWidth,
    hasAddButton,
    rightPadding,
    horizontalPadding,
  ]);

  const hiddenTabs = useMemo(() => {
    return visibleTabs.slice(visibleTabCount);
  }, [visibleTabs, visibleTabCount]);

  const hiddenTabsCount = hiddenTabs.length;
  const hasHiddenTabs = hiddenTabsCount > 0;

  const onTabWidthChange = useCallback(
    (tabId: string) => (dimensions: TabListDimensions) => {
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

  const onContainerWidthChange = useCallback(
    (dimensions: TabListDimensions) => {
      setContainerWidth((prev) => {
        return prev !== dimensions.width ? dimensions.width : prev;
      });
    },
    [],
  );

  const onMoreButtonWidthChange = useCallback(
    (dimensions: TabListDimensions) => {
      setMoreButtonWidth((prev) => {
        return prev !== dimensions.width ? dimensions.width : prev;
      });
    },
    [],
  );

  const onAddButtonWidthChange = useCallback(
    (dimensions: TabListDimensions) => {
      setAddButtonWidth((prev) => {
        return prev !== dimensions.width ? dimensions.width : prev;
      });
    },
    [],
  );

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
