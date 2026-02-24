import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useCallback } from 'react';

type UseLegendItemToggleProps = {
  itemIds: string[];
  isInteractive: boolean;
};

export const useLegendItemToggle = ({
  itemIds,
  isInteractive,
}: UseLegendItemToggleProps) => {
  const setHiddenLegendIds = useSetRecoilComponentStateV2(
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
