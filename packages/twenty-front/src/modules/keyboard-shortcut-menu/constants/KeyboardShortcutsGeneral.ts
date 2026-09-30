import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';

export const KEYBOARD_SHORTCUTS_GENERAL: Shortcut[] = [
  {
    label: 'Open search',
    shortcuts: [{ type: 'combination', keys: ['Mod', 'K'] }],
  },
  {
    label: 'Mark as favourite',
    shortcuts: [{ type: 'combination', keys: ['⇧', 'F'] }],
  },
];
