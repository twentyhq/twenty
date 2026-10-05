import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';
import { msg } from '@lingui/core/macro';

export const KEYBOARD_SHORTCUTS_GENERAL: Shortcut[] = [
  {
    label: msg`Open search`,
    shortcuts: [['Mod', 'K']],
  },
  {
    label: msg`Mark as favourite`,
    shortcuts: [['⇧', 'F']],
  },
];
