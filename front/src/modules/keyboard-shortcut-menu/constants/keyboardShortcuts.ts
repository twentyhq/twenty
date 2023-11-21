import { Shortcut, ShortcutType } from '../types/Shortcut';

export const keyboardShortcutsTable: Shortcut[] = [
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

export const keyboardShortcutsGeneral: Shortcut[] = [
  {
    label: 'Open search',
    type: ShortcutType.General,
    firstHotKey: '⌘',
    secondHotKey: 'K',
    areSimultaneous: false,
  },
  {
    label: 'Mark as favourite',
    type: ShortcutType.General,
    firstHotKey: '⇧',
    secondHotKey: 'F',
    areSimultaneous: false,
  },
];
