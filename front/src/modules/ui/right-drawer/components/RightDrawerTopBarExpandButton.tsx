import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { LightIconButton } from '@/ui/button/components/LightIconButton';

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
