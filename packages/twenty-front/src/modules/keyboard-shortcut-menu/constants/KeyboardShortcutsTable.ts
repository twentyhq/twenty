import { Shortcut, ShortcutType } from '../types/Shortcut';

export const KEYBOARD_SHORTCUTS_TABLE: Shortcut[] = [
  {
    label: 'Move right',
    type: ShortcutType.Table,
    firstHotKey: '→',
    areSimultaneous: true,
  },
  {
    label: 'Move left',
    type: ShortcutType.Table,
    firstHotKey: '←',
    areSimultaneous: true,
  },
  {
    label: 'Clear selection',
    type: ShortcutType.Table,
    firstHotKey: 'esc',
    areSimultaneous: true,
  },
];
