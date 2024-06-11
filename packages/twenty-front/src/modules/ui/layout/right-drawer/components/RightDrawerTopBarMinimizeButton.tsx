import { IconMinus } from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';

export const RightDrawerTopBarMinimizeButton = () => {
  const { isRightDrawerMinimized, minimizeRightDrawer, maximizeRightDrawer } =
    useRightDrawer();

  const handleButtonClick = () => {
    isRightDrawerMinimized ? maximizeRightDrawer() : minimizeRightDrawer();
  };

  return (
    <LightIconButton
      Icon={IconMinus}
      onClick={handleButtonClick}
      size="medium"
      accent="tertiary"
    />
  );
};
