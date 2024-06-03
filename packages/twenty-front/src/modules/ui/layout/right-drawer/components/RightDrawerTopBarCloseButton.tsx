import { IconX } from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

import { useRightDrawer } from '../hooks/useRightDrawer';

export const RightDrawerTopBarCloseButton = () => {
  const { closeRightDrawer } = useRightDrawer();

  const handleButtonClick = () => {
    closeRightDrawer();
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
