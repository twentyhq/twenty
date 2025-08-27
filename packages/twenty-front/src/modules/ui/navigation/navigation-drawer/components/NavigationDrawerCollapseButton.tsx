import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledCollapseButton = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
  justify-content: center;
  user-select: none;
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
      <LightIconButton
        Icon={
          direction === 'left'
            ? IconLayoutSidebarLeftCollapse
            : IconLayoutSidebarRightCollapse
        }
        accent="tertiary"
        size="small"
      />
    </StyledCollapseButton>
  );
};
