import { useRecoilState } from 'recoil';

import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@/ui/Display/Icon';
import { LightIconButton } from '@/ui/Input/Button/components/LightIconButton';

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
