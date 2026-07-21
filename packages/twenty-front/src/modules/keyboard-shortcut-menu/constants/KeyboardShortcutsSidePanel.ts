import {
  type Shortcut,
  ShortcutType,
} from '@/keyboard-shortcut-menu/types/Shortcut';

export const KEYBOARD_SHORTCUTS_SIDE_PANEL: Shortcut[] = [
  {
    label: 'Clear search, go back, or close',
    type: ShortcutType.SidePanel,
    firstHotKey: 'esc',
    areSimultaneous: true,
  },
  {
    label: 'Go back when search is empty',
    type: ShortcutType.SidePanel,
    firstHotKey: '⌫',
    areSimultaneous: true,
  },
  {
    label: 'Move through list items',
    type: ShortcutType.SidePanel,
    firstHotKey: '↑',
    secondHotKey: '↓',
    areSimultaneous: true,
  },
  {
    label: 'Open selected list item',
    type: ShortcutType.SidePanel,
    firstHotKey: '↵',
    areSimultaneous: true,
  },
];
