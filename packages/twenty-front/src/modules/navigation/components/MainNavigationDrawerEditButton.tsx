import { css } from '@linaria/core';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPaint } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NAVIGATION_DRAWER_CLICK_OUTSIDE_ID } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerClickOutsideId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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
  const isMobile = useIsMobile();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();

  if (
    !isCustomizableSidebarEnabled ||
    isMobile ||
    !hasLayoutsPermission ||
    !isLayoutCustomizationAllowedOnCurrentPage ||
    isLayoutCustomizationModeEnabled
  ) {
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
