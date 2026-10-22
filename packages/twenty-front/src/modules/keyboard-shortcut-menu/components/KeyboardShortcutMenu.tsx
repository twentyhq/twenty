import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';

import { KeyboardShortcutMenuOpenContent } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuOpenContent';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';

export const KeyboardShortcutMenu = () => {
  const { toggleKeyboardShortcutMenu } = useKeyboardShortcutMenu();
  const { closeSidePanelMenu } = useSidePanelMenu();

  useGlobalHotkeys({
    keys: ['shift+?', 'meta+?'],
    callback: () => {
      closeSidePanelMenu();
      toggleKeyboardShortcutMenu();
    },
    containsModifier: false,
    dependencies: [toggleKeyboardShortcutMenu],
  });

  return <KeyboardShortcutMenuOpenContent />;
};
