import { useStore } from 'jotai';
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

  const isOverVisibleItemLimit =
    isDefined(visibleItemLimit) && items.length > visibleItemLimit;

  const visibleItems =
    isOverVisibleItemLimit && !isNavigationSectionShowingAllItems
      ? items.slice(0, visibleItemLimit)
      : items;

  const toggleShowingAllItems = () => {
    store.set(
      isNavigationSectionShowingAllItemsFamilyState.atomFamily(
        navigationSectionId,
      ),
      !isNavigationSectionShowingAllItems,
    );
  };

  return {
    visibleItems,
    isOverVisibleItemLimit,
    isShowingAllItems: isNavigationSectionShowingAllItems,
    toggleShowingAllItems,
  };
};
