import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';
import { msg } from '@lingui/core/macro';

export const KEYBOARD_SHORTCUTS_GENERAL: Shortcut[] = [
  {
    label: msg`Open search`,
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These keyboard tokens must match shortcut dispatch.
    shortcuts: [['Mod', 'K']],
  },
  {
    label: msg`Mark as favourite`,
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These keyboard tokens must match shortcut dispatch.
    shortcuts: [['⇧', 'F']],
  },
];
