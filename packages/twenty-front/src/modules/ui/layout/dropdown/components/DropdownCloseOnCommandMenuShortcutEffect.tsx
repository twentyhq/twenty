import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponeInstanceContext';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { isDefined } from 'twenty-shared/utils';

export const DropdownCloseOnCommandMenuShortcutEffect = () => {
  const { closeDropdown } = useDropdownV2();

  const dropdownId = useComponentInstanceStateContext(
    DropdownComponentInstanceContext,
  )?.instanceId;

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      if (isDefined(dropdownId)) {
        closeDropdown(dropdownId);
      }
    },
    AppHotkeyScope.CommandMenu,
    [closeDropdown, dropdownId],
    {
      preventDefault: false,
    },
  );
  return null;
};
