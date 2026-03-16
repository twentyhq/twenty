import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsCommandBlockedByGlobalLayoutCustomization = (
  commandMenuItemConfig: CommandMenuItemConfig | null,
) => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  if (!isLayoutCustomizationActive) {
    return false;
  }

  return !commandMenuItemConfig?.isAllowedDuringGlobalLayoutCustomization;
};
