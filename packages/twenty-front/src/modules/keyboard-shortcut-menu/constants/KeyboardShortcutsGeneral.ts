import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';
import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';

export const KEYBOARD_SHORTCUTS_GENERAL: Shortcut[] = [
  {
    label: msg`Open search`,
    shortcuts: [doNotTranslate(['Mod', 'K'])],
  },
  {
    label: msg`Mark as favourite`,
    shortcuts: [['⇧', doNotTranslate('F')]],
  },
];
