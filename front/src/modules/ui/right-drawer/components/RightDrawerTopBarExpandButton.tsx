import { useRecoilState } from 'recoil';

import { LightIconButton } from '@/ui/button/components/LightIconButton';
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@/ui/icon';

import { isRightDrawerExpandedState } from '../states/isRightDrawerExpandedState';

export const RightDrawerTopBarExpandButton = () => {
  const [isRightDrawerExpanded, setIsRightDrawerExpanded] = useRecoilState(
    isRightDrawerExpandedState,
  );

  const handleButtonClick = () => {
    setIsRightDrawerExpanded(!isRightDrawerExpanded);
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
