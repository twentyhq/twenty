import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsCommandBlockedByGlobalLayoutCustomization = (
  commandMenuItemConfig: CommandMenuItemConfig | null,
) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  if (!isLayoutCustomizationModeEnabled) {
    return false;
  }

  return !commandMenuItemConfig?.isAllowedDuringGlobalLayoutCustomization;
};
