import { Shortcut, ShortcutType } from '../types/Shortcut';

export const KEYBOARD_SHORTCUTS_GENERAL: Shortcut[] = [
  {
    label: 'Abrir pesquisa',
    type: ShortcutType.General,
    firstHotKey: '⌘',
    secondHotKey: 'K',
    areSimultaneous: false,
  },
  {
    label: 'Marcar como favorito',
    type: ShortcutType.General,
    firstHotKey: '⇧',
    secondHotKey: 'F',
    areSimultaneous: false,
  },
];
