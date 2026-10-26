import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightButton } from 'twenty-ui/components/input';
import { IconTool } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledButtonRow = styled.div`
  display: flex;
`;

export const MainNavigationDrawerCustomizeButton = () => {
  const { t } = useLingui();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  if (
    !hasLayoutsPermission ||
    !isExpanded ||
    isLayoutCustomizationModeEnabled
  ) {
    return null;
  }

  return (
    <NavigationDrawerFixedContent>
      <StyledButtonRow>
        <LightButton
          emphasis="subtle"
          size="sm"
          startIcon={<IconTool />}
          onMouseEnter={preloadNavigationMenuItemDndKit}
          onClick={() => enterLayoutCustomizationMode()}
        >
          {t`Customize sidebar`}
        </LightButton>
      </StyledButtonRow>
    </NavigationDrawerFixedContent>
  );
};
