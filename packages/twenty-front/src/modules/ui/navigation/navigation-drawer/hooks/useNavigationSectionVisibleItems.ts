import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isNavigationSectionShowingAllItemsFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionShowingAllItemsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useNavigationSectionVisibleItems = <TItem>({
  navigationSectionId,
  items,
  visibleItemLimit,
}: {
  navigationSectionId: string;
  items: TItem[];
  visibleItemLimit?: number | null;
}) => {
  const store = useStore();
  const isNavigationSectionShowingAllItems = useAtomFamilyStateValue(
    isNavigationSectionShowingAllItemsFamilyState,
    navigationSectionId,
  );

  const exceedsVisibleItemLimit =
    isDefined(visibleItemLimit) && items.length > visibleItemLimit;

  const visibleItems =
    exceedsVisibleItemLimit && !isNavigationSectionShowingAllItems
      ? items.slice(0, visibleItemLimit)
      : items;

  const toggleShowingAllItems = useCallback(() => {
    store.set(
      isNavigationSectionShowingAllItemsFamilyState.atomFamily(
        navigationSectionId,
      ),
      !isNavigationSectionShowingAllItems,
    );
  }, [store, navigationSectionId, isNavigationSectionShowingAllItems]);

  return {
    visibleItems,
    exceedsVisibleItemLimit,
    isShowingAllItems: isNavigationSectionShowingAllItems,
    toggleShowingAllItems,
  };
};
