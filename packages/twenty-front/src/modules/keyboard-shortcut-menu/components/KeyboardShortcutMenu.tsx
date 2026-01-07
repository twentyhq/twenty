import { useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';

import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { isKeyboardShortcutMenuOpenedState } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedState';

import { KeyboardShortcutMenuOpenContent } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuOpenContent';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';

export const KeyboardShortcutMenu = () => {
  const { toggleKeyboardShortcutMenu } = useKeyboardShortcutMenu();
  const isKeyboardShortcutMenuOpened = useRecoilValue(
    isKeyboardShortcutMenuOpenedState,
  );
  const { closeCommandMenu } = useCommandMenu();

  useGlobalHotkeys({
    keys: ['shift+?', 'meta+?'],
    callback: () => {
      closeCommandMenu();
      toggleKeyboardShortcutMenu();
    },
    containsModifier: false,
    dependencies: [toggleKeyboardShortcutMenu],
  });

  return (
    <>{isKeyboardShortcutMenuOpened && <KeyboardShortcutMenuOpenContent />}</>
  );
};
