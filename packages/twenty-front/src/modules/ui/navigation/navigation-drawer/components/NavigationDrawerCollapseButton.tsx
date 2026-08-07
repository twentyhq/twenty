import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCollapseButton = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.light};
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
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );

  const handleClick = () => {
    setIsNavigationDrawerExpanded((previousIsExpanded) => !previousIsExpanded);
  };

  return (
    <StyledCollapseButton className={className} onClick={handleClick}>
      <LightIconButton
        Icon={
          direction === 'left'
            ? IconLayoutSidebarLeftCollapse
            : IconLayoutSidebarRightCollapse
        }
        accent="secondary"
        size="small"
        aria-label={
          direction === 'left'
            ? t`Collapse navigation panel`
            : t`Expand navigation panel`
        }
      />
    </StyledCollapseButton>
  );
};
