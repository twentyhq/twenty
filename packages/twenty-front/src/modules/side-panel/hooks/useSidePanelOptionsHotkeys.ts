import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { type KeyboardEvent } from 'react';

export const useSidePanelOptionsHotkeys = (dropdownId: string) => {
  const { toggleDropdown } = useToggleDropdown();
  const onToggle = () =>
    toggleDropdown({
      dropdownComponentInstanceIdFromProps: dropdownId,
      globalHotkeysConfig: { enableGlobalHotkeysWithModifiers: true },
    });
  const hotkeysConfig = {
    keys: ['ctrl+o', 'meta+o'],
    callback: onToggle,
    dependencies: [onToggle],
  };

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: SIDE_PANEL_FOCUS_ID,
  });

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: dropdownId,
  });

  const handleContentKeyDown = (event: KeyboardEvent) => {
    const isOptionsShortcut =
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === 'o' &&
      !event.nativeEvent.isComposing;

    if (!isOptionsShortcut) {
      return;
    }

    event.preventDefault();
    onToggle();
  };

  return { handleContentKeyDown };
};
