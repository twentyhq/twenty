import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { IconChevronsRight } from '@/ui/icon/index';

import { useRightDrawer } from '../hooks/useRightDrawer';

export const RightDrawerTopBarCloseButton = () => {
  const { closeRightDrawer } = useRightDrawer();

  const handleButtonClick = () => {
    closeRightDrawer();
  };

  return (
    <LightIconButton
      Icon={IconChevronsRight}
      onClick={handleButtonClick}
      size="medium"
      accent="tertiary"
    />
  );
};
