import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';

export const KEYBOARD_SHORTCUTS_SIDE_PANEL: Shortcut[] = [
  {
    label: 'Clear search, go back, or close',
    shortcuts: [{ type: 'combination', keys: ['esc'] }],
  },
  {
    label: 'Go back when search is empty',
    shortcuts: [{ type: 'combination', keys: ['⌫'] }],
  },
  {
    label: 'Move through list items',
    shortcuts: [
      { type: 'combination', keys: ['↑'] },
      { type: 'combination', keys: ['↓'] },
    ],
  },
  {
    label: 'Open selected list item',
    shortcuts: [{ type: 'combination', keys: ['↵'] }],
  },
];
