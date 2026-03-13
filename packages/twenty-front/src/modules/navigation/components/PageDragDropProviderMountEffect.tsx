import { useEffect } from 'react';

import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type PageDragDropProviderMountEffectProps = {
  onEnterEditMode: () => void;
};

export const PageDragDropProviderMountEffect = ({
  onEnterEditMode,
}: PageDragDropProviderMountEffectProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );

  useEffect(() => {
    if (isNavigationMenuInEditMode) {
      onEnterEditMode();
    }
  }, [isNavigationMenuInEditMode, onEnterEditMode]);

  return null;
};
