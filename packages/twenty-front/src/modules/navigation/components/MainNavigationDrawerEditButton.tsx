import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { MainNavigationDrawerModeButton } from '@/navigation/components/MainNavigationDrawerModeButton';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NAVIGATION_DRAWER_CLICK_OUTSIDE_ID } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerClickOutsideId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledShownOnDrawerHover = styled.div`
  display: flex;
  opacity: 0;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s);

  [data-click-outside-id='${NAVIGATION_DRAWER_CLICK_OUTSIDE_ID}']:hover &,
  &:focus-within {
    opacity: 1;
  }
`;

type MainNavigationDrawerEditButtonProps = {
  isExpanded: boolean;
  isTooltipDisabled: boolean;
};

export const MainNavigationDrawerEditButton = ({
  isExpanded,
  isTooltipDisabled,
}: MainNavigationDrawerEditButtonProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  if (isMobile || !hasLayoutsPermission || isLayoutCustomizationModeEnabled) {
    return null;
  }

  return (
    <StyledShownOnDrawerHover onMouseEnter={preloadNavigationMenuItemDndKit}>
      <MainNavigationDrawerModeButton
        Icon={IconTool}
        label={t`Edit navigation`}
        tooltip={t`Edit navigation`}
        isTooltipDisabled={isTooltipDisabled}
        isActive={false}
        isExpanded={isExpanded}
        onClick={enterLayoutCustomizationMode}
      />
    </StyledShownOnDrawerHover>
  );
};
