import { IconChevronsRight } from '@/ui/icon/index';

import { IconButton } from '../../button/components/IconButton';
import { useRightDrawer } from '../hooks/useRightDrawer';

export function RightDrawerTopBarCloseButton() {
  const { closeRightDrawer } = useRightDrawer();

  function handleButtonClick() {
    closeRightDrawer();
  }

  return (
    <IconButton
      icon={<IconChevronsRight size={16} />}
      onClick={handleButtonClick}
    />
  );
}
