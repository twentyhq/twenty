import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';
import { msg } from '@lingui/core/macro';

export const KEYBOARD_SHORTCUTS_TABLE: Shortcut[] = [
  {
    label: msg`Move right`,
    shortcuts: [['→']],
  },
  {
    label: msg`Move left`,
    shortcuts: [['←']],
  },
  {
    label: msg`Clear selection`,
    shortcuts: [['esc']],
  },
];
