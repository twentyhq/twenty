import { useRecoilState } from 'recoil';
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  LightIconButton,
} from 'twenty-ui';

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
