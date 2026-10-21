import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useNavigationDrawerTogglePresentation } from '@/ui/navigation/navigation-drawer/hooks/useNavigationDrawerTogglePresentation';
import { useToggleNavigationDrawer } from '@/ui/navigation/navigation-drawer/hooks/useToggleNavigationDrawer';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useNavigationDrawerExpandButtonFocusHandOff } from '@/ui/navigation/navigation-drawer/hooks/useNavigationDrawerExpandButtonFocusHandOff';
import { useIsMobile } from 'twenty-ui/utilities';
import { LightIconButton } from 'twenty-ui/components/input';

type NavigationDrawerCollapseButtonProps = {
  direction?: 'left' | 'right';
  size?: 'sm' | 'md';
};

export const NavigationDrawerCollapseButton = ({
  direction = 'left',
  size,
}: NavigationDrawerCollapseButtonProps) => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { toggleNavigationDrawer } = useToggleNavigationDrawer();
  const { label, Icon } = useNavigationDrawerTogglePresentation(
    direction === 'left',
  );
  const expandButtonFocusHandOffRef =
    useNavigationDrawerExpandButtonFocusHandOff();

  // The main navigation is a page on mobile, so there is no drawer to toggle.
  if (isMobile && !isSettingsDrawer) {
    return null;
  }

  return (
    <LightIconButton
      ref={direction === 'right' ? expandButtonFocusHandOffRef : undefined}
      emphasis="standard"
      size={size ?? (isMobile ? 'md' : 'sm')}
      onClick={toggleNavigationDrawer}
      aria-label={label}
      tooltip={label}
      tooltipDelay={TooltipDelay.longDelay}
      tooltipPlace="bottom"
      tooltipOffset={5}
    >
      <Icon />
    </LightIconButton>
  );
};
