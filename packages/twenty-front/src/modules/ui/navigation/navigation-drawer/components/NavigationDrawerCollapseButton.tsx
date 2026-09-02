import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useNavigationDrawerTogglePresentation } from '@/navigation/hooks/useNavigationDrawerTogglePresentation';
import { useToggleNavigationDrawer } from '@/navigation/hooks/useToggleNavigationDrawer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { useId } from 'react';
import { LightIconButton } from 'twenty-ui/input';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/surfaces';
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
  const tooltipId = useId();
  const { label, Icon } = useNavigationDrawerTogglePresentation(
    direction === 'left',
  );

  // The main navigation is a page on mobile, so there is no drawer to toggle.
  if (isMobile && !isSettingsDrawer) {
    return null;
  }

  return (
    <StyledCollapseButton className={className} data-tooltip-id={tooltipId}>
      <LightIconButton
        Icon={Icon}
        accent="secondary"
        size="small"
        onClick={toggleNavigationDrawer}
        aria-label={label}
      />
      <AppTooltip
        anchorSelect={`[data-tooltip-id='${tooltipId}'] > button`}
        content={label}
        delay={TooltipDelay.longDelay}
        place={TooltipPosition.Bottom}
        offset={5}
        noArrow
      />
    </StyledCollapseButton>
  );
};
