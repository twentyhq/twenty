import { IconButton } from '@/ui/input/button/components/IconButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from 'twenty-ui';

const StyledCollapseButton = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  user-select: none;
  width: ${({ theme }) => theme.spacing(4)};
`;

type NavigationDrawerCollapseButtonProps = {
  className?: string;
  direction?: 'left' | 'right';
};

export const NavigationDrawerCollapseButton = ({
  className,
  direction = 'left',
}: NavigationDrawerCollapseButtonProps) => {
  const setIsNavigationDrawerExpanded = useSetRecoilState(
    isNavigationDrawerExpandedState,
  );

  return (
    <StyledCollapseButton
      className={className}
      onClick={() =>
        setIsNavigationDrawerExpanded(
          (previousIsExpanded) => !previousIsExpanded,
        )
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
