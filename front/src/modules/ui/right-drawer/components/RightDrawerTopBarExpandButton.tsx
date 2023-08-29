import { useRecoilState } from 'recoil';

import { LightIconButton } from '@/ui/button/components/LightIconButton';
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@/ui/icon';

import { isRightDrawerExpandedState } from '../states/isRightDrawerExpandedState';

export function RightDrawerTopBarExpandButton() {
  const [isRightDrawerExpanded, setIsRightDrawerExpanded] = useRecoilState(
    isRightDrawerExpandedState,
  );

  function handleButtonClick() {
    setIsRightDrawerExpanded(!isRightDrawerExpanded);
  }

  return (
    <LightIconButton
      size="medium"
      accent="tertiary"
      icon={
        isRightDrawerExpanded ? (
          <IconLayoutSidebarRightCollapse />
        ) : (
          <IconLayoutSidebarRightExpand />
        )
      }
      onClick={handleButtonClick}
    />
  );
}
