import { type Shortcut } from '@/keyboard-shortcut-menu/types/Shortcut';
import { msg } from '@lingui/core/macro';

export const KEYBOARD_SHORTCUTS_SIDE_PANEL: Shortcut[] = [
  {
    label: msg`Clear search, go back, or close`,
    shortcuts: [['esc']],
  },
  {
    label: msg`Go back when search is empty`,
    shortcuts: [['⌫']],
  },
  {
    label: msg`Move through list items`,
    shortcuts: [['↑'], ['↓']],
  },
  {
    label: msg`Open selected list item`,
    shortcuts: [['↵']],
  },
];
