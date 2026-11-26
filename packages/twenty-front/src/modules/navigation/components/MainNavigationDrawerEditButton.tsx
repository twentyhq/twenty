import { css } from '@linaria/core';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPaint } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useCanCustomizeSidebar } from '@/navigation/hooks/useCanCustomizeSidebar';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { NAVIGATION_DRAWER_CLICK_OUTSIDE_ID } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerClickOutsideId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const editButtonClassName = css`
  opacity: 0;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s);

  [data-click-outside-id='${NAVIGATION_DRAWER_CLICK_OUTSIDE_ID}']:hover &,
  &:focus-visible {
    opacity: 1;
  }
`;

export const MainNavigationDrawerEditButton = () => {
  const { t } = useLingui();
  const canCustomizeSidebar = useCanCustomizeSidebar();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  if (!canCustomizeSidebar || isLayoutCustomizationModeEnabled) {
    return null;
  }

  return (
    <LightIconButton
      className={editButtonClassName}
      emphasis="standard"
      size="sm"
      onClick={() => enterLayoutCustomizationMode()}
      onMouseEnter={preloadNavigationMenuItemDndKit}
      aria-label={t`Customize sidebar`}
      tooltip={t`Customize sidebar`}
      tooltipDelay={TooltipDelay.longDelay}
      tooltipPlace="bottom"
      tooltipOffset={5}
    >
      <IconPaint />
    </LightIconButton>
  );
};
