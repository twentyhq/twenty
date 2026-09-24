import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { OPTIONS_DROPDOWN_GLOBAL_HOTKEYS_CONFIG } from '@/ui/layout/dropdown/constants/OptionsDropdownGlobalHotkeysConfig';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

export const useSidePanelOptionsHotkeys = (dropdownId: string) => {
  const { toggleDropdown } = useToggleDropdown();

  const hotkeysConfig = {
    keys: ['ctrl+o', 'meta+o'],
    callback: () =>
      toggleDropdown({
        dropdownComponentInstanceIdFromProps: dropdownId,
        globalHotkeysConfig: OPTIONS_DROPDOWN_GLOBAL_HOTKEYS_CONFIG,
      }),
    dependencies: [toggleDropdown, dropdownId],
  };

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: SIDE_PANEL_FOCUS_ID,
  });

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: dropdownId,
  });
};
