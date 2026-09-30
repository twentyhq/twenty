import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';

export const KEYBOARD_SHORTCUTS_TABLE: Shortcut[] = [
  {
    label: 'Move right',
    shortcuts: [{ type: 'combination', keys: ['→'] }],
  },
  {
    label: 'Move left',
    shortcuts: [{ type: 'combination', keys: ['←'] }],
  },
  {
    label: 'Clear selection',
    shortcuts: [{ type: 'combination', keys: ['esc'] }],
  },
];
