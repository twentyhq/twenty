import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTool } from 'twenty-ui/icon';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useCanCustomizeSidebar } from '@/navigation/hooks/useCanCustomizeSidebar';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
