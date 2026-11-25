import { useStore } from 'jotai';
import { useEffect } from 'react';

import { navigationMenuTabIdToOpenFirstItemState } from '@/navigation-menu-item/common/states/navigationMenuTabIdToOpenFirstItemState';

type NavigationMenuTabFirstItemRequestResetEffectProps = {
  navigationMenuTabId: string | null;
};

export const NavigationMenuTabFirstItemRequestResetEffect = ({
  navigationMenuTabId,
}: NavigationMenuTabFirstItemRequestResetEffectProps) => {
  const store = useStore();

  useEffect(() => {
    if (
      store.get(navigationMenuTabIdToOpenFirstItemState.atom) ===
      navigationMenuTabId
    ) {
      store.set(navigationMenuTabIdToOpenFirstItemState.atom, null);
    }
  }, [navigationMenuTabId, store]);

  return null;
};
