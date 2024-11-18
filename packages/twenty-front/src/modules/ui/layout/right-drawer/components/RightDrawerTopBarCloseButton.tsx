import { IconX, LightIconButton } from 'twenty-ui';

import { useRightDrawer } from '../hooks/useRightDrawer';
import { emitRightDrawerCloseEvent } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';

export const RightDrawerTopBarCloseButton = () => {
  const { closeRightDrawer } = useRightDrawer();

  const handleButtonClick = () => {
    closeRightDrawer();
    emitRightDrawerCloseEvent();
  };

  return (
    <LightIconButton
      Icon={IconX}
      onClick={handleButtonClick}
      size="medium"
      accent="tertiary"
    />
  );
};
