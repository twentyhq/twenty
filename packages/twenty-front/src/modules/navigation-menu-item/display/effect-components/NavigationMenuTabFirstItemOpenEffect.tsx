import { useStore } from 'jotai';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuTabIdContext } from '@/navigation-menu-item/common/contexts/NavigationMenuTabIdContext';
import { navigationMenuTabIdToOpenFirstItemState } from '@/navigation-menu-item/common/states/navigationMenuTabIdToOpenFirstItemState';

type NavigationMenuTabFirstItemOpenEffectProps =
  | { to: string }
  | { onOpen: () => void };

export const NavigationMenuTabFirstItemOpenEffect = (
  props: NavigationMenuTabFirstItemOpenEffectProps,
) => {
  const store = useStore();
  const navigate = useNavigate();
  const navigationMenuTabId = useContext(NavigationMenuTabIdContext);

  const openTabFirstItem = () => {
    if (
      !isDefined(navigationMenuTabId) ||
      store.get(navigationMenuTabIdToOpenFirstItemState.atom) !==
        navigationMenuTabId
    ) {
      return;
    }

    store.set(navigationMenuTabIdToOpenFirstItemState.atom, null);

    if ('to' in props) {
      navigate(props.to);
    } else {
      props.onOpen();
    }
  };

  useEffect(() => {
    openTabFirstItem();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
