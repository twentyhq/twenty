import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { IconChevronsRight } from '@/ui/icon/index';

import { useRightDrawer } from '../hooks/useRightDrawer';

export function RightDrawerTopBarCloseButton() {
  const { closeRightDrawer } = useRightDrawer();

  function handleButtonClick() {
    closeRightDrawer();
  }

  return (
    <LightIconButton
      icon={<IconChevronsRight />}
      onClick={handleButtonClick}
      size="medium"
      accent="tertiary"
    />
  );
}
