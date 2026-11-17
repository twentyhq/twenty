import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTool } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type MainNavigationDrawerEditButtonProps = {
  size: 'sm' | 'md';
};

export const MainNavigationDrawerEditButton = ({
  size,
}: MainNavigationDrawerEditButtonProps) => {
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

  if (
    !isCustomizableSidebarEnabled ||
    isMobile ||
    !hasLayoutsPermission ||
    isLayoutCustomizationModeEnabled
  ) {
    return null;
  }

  return (
    <div onMouseEnter={preloadNavigationMenuItemDndKit}>
      <LightIconButton
        emphasis="standard"
        size={size}
        onClick={() => enterLayoutCustomizationMode()}
        aria-label={t`Customize sidebar`}
      >
        <IconTool />
      </LightIconButton>
    </div>
  );
};
