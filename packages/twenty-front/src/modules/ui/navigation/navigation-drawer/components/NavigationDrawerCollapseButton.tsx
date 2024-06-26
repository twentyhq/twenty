import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from 'twenty-ui';

import { IconButton } from '@/ui/input/button/components/IconButton';
import { isNavigationDrawerOpenState } from '@/ui/navigation/states/isNavigationDrawerOpenState';

const StyledCollapseButton = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
  height: ${({ theme }) => theme.spacing(5)};
  justify-content: center;
  user-select: none;
  width: ${({ theme }) => theme.spacing(6)};

  &:hover {
    background: ${({ theme }) => theme.background.quaternary};
  }
`;

type NavigationDrawerCollapseButtonProps = {
  className?: string;
  direction?: 'left' | 'right';
};

export const NavigationDrawerCollapseButton = ({
  className,
  direction = 'left',
}: NavigationDrawerCollapseButtonProps) => {
  const setIsNavigationDrawerOpen = useSetRecoilState(
    isNavigationDrawerOpenState,
  );

  return (
    <StyledCollapseButton
      className={className}
      onClick={() =>
        setIsNavigationDrawerOpen((previousIsOpen) => !previousIsOpen)
      }
    >
      <IconButton
        Icon={
          direction === 'left'
            ? IconLayoutSidebarLeftCollapse
            : IconLayoutSidebarRightCollapse
        }
        variant="tertiary"
        size="small"
      />
    </StyledCollapseButton>
  );
};
