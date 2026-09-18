import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useNavigationDrawerTogglePresentation } from '@/navigation/hooks/useNavigationDrawerTogglePresentation';
import { useToggleNavigationDrawer } from '@/navigation/hooks/useToggleNavigationDrawer';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { LightIconButton } from 'twenty-ui/components';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
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
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { toggleNavigationDrawer } = useToggleNavigationDrawer();
  const { label, Icon } = useNavigationDrawerTogglePresentation(
    direction === 'left',
  );

  // The main navigation is a page on mobile, so there is no drawer to toggle.
  if (isMobile && !isSettingsDrawer) {
    return null;
  }

  return (
    <Tooltip
      content={label}
      delay={TooltipDelay.longDelay}
      side="bottom"
      sideOffset={5}
    >
      <StyledCollapseButton className={className}>
        <LightIconButton
          Icon={Icon}
          accent="secondary"
          size="small"
          onClick={toggleNavigationDrawer}
          aria-label={label}
        />
      </StyledCollapseButton>
    </Tooltip>
  );
};
