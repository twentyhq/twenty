import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';

export const RightDrawerTopBarExpandButton = () => {
  const { isRightDrawerExpanded, downsizeRightDrawer, expandRightDrawer } =
    useRightDrawer();

  const handleButtonClick = () => {
    if (isRightDrawerExpanded === true) {
      downsizeRightDrawer();
      return;
    }
    expandRightDrawer();
  };

  return (
    <LightIconButton
      size="medium"
      accent="tertiary"
      Icon={
        isRightDrawerExpanded
          ? IconLayoutSidebarRightCollapse
          : IconLayoutSidebarRightExpand
      }
      onClick={handleButtonClick}
    />
  );
};
