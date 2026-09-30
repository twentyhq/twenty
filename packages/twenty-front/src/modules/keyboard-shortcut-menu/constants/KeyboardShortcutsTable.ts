import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';

export const KEYBOARD_SHORTCUTS_TABLE: Shortcut[] = [
  {
    label: 'Move right',
    shortcuts: [['→']],
  },
  {
    label: 'Move left',
    shortcuts: [['←']],
  },
  {
    label: 'Clear selection',
    shortcuts: [['esc']],
  },
];
