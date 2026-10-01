import { useEffect, useState } from 'react';
import { useDropdownPage } from 'twenty-ui/components';

import { type NavigationMenuItemMenuMode } from '@/navigation-menu-item/edit/types/NavigationMenuItemMenuMode';

type NavigationMenuItemMenuModeEffectProps = {
  mode: NavigationMenuItemMenuMode['type'];
};

export const NavigationMenuItemMenuModeEffect = ({
  mode,
}: NavigationMenuItemMenuModeEffectProps) => {
  const [previousMode, setPreviousMode] = useState(mode);
  const [isReturningToRoot, setIsReturningToRoot] = useState(false);
  const { canGoBack, goBack } = useDropdownPage();

  useEffect(() => {
    if (previousMode === mode && !isReturningToRoot) {
      return;
    }

    setPreviousMode(mode);
    setIsReturningToRoot(canGoBack);

    if (canGoBack) {
      goBack();
    }
  }, [mode, previousMode, isReturningToRoot, canGoBack, goBack]);

  return null;
};
