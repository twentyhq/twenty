import { getOsSpecificControlSymbol } from '@/shortcuts/utils/getOsSpecificControlSymbol';
import { Shortcut, ShortcutType } from '../types/Shortcut';

export const KEYBOARD_SHORTCUTS_GENERAL: Shortcut[] = [
  {
    label: 'Open search',
    type: ShortcutType.General,
    firstHotKey: `${getOsSpecificControlSymbol()}`,
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
