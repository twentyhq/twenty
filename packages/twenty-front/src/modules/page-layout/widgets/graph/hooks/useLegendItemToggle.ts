import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useCallback } from 'react';

type UseLegendItemToggleProps = {
  itemIds: string[];
  isInteractive: boolean;
};

export const useLegendItemToggle = ({
  itemIds,
  isInteractive,
}: UseLegendItemToggleProps) => {
  const setHiddenLegendIds = useSetRecoilComponentState(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const toggleLegendItem = useCallback(
    (itemId: string) => {
      if (!isInteractive) return;

      setHiddenLegendIds((previousHiddenIds) => {
        const hasStaleIds = previousHiddenIds.some(
          (id) => !itemIds.includes(id),
        );

        const validHiddenIds = hasStaleIds ? [] : previousHiddenIds;

        const isCurrentlyHidden = validHiddenIds.includes(itemId);

        if (isCurrentlyHidden) {
          return validHiddenIds.filter((id) => id !== itemId);
        }

        const visibleCount = itemIds.length - validHiddenIds.length;
        if (visibleCount <= 1) {
          return validHiddenIds;
        }

        return [...validHiddenIds, itemId];
      });
    },
    [isInteractive, itemIds, setHiddenLegendIds],
  );

  return { toggleLegendItem };
};
