import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';

export const KEYBOARD_SHORTCUTS_SIDE_PANEL: Shortcut[] = [
  {
    label: 'Clear search, go back, or close',
    shortcuts: [['esc']],
  },
  {
    label: 'Go back when search is empty',
    shortcuts: [['⌫']],
  },
  {
    label: 'Move through list items',
    shortcuts: [['↑'], ['↓']],
  },
  {
    label: 'Open selected list item',
    shortcuts: [['↵']],
  },
];
