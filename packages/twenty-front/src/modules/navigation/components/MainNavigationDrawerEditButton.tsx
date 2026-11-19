import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTool } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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
      <IconTool />
    </LightIconButton>
  );
};
