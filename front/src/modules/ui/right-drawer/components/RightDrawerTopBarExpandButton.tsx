import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { IconButton } from '../../button/components/IconButton';
import { isRightDrawerExpandedState } from '../states/isRightDrawerExpandedState';

export function RightDrawerTopBarExpandButton() {
  const [isRightDrawerExpanded, setIsRightDrawerExpanded] = useRecoilState(
    isRightDrawerExpandedState,
  );

  function handleButtonClick() {
    setIsRightDrawerExpanded(!isRightDrawerExpanded);
  }

  return (
    <IconButton
      icon={
        isRightDrawerExpanded ? (
          <IconLayoutSidebarRightCollapse size={16} />
        ) : (
          <IconLayoutSidebarRightExpand size={16} />
        )
      }
      onClick={handleButtonClick}
    />
  );
}
