import { useStore } from 'jotai';
import { useEffect } from 'react';

import { shouldOpenFirstTabSwitchTargetState } from '@/ui/navigation/states/shouldOpenFirstTabSwitchTargetState';

type NavigationDrawerItemTabSwitchOpenEffectProps = {
  onOpen: () => void;
};

export const NavigationDrawerItemTabSwitchOpenEffect = ({
  onOpen,
}: NavigationDrawerItemTabSwitchOpenEffectProps) => {
  const store = useStore();

  useEffect(() => {
    if (!store.get(shouldOpenFirstTabSwitchTargetState.atom)) {
      return;
    }

    store.set(shouldOpenFirstTabSwitchTargetState.atom, false);
    onOpen();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
