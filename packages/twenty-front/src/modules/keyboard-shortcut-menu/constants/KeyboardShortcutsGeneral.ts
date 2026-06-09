import {
  type Shortcut,
  ShortcutType,
} from '@/keyboard-shortcut-menu/types/Shortcut';
import { getOsControlSymbol } from 'twenty-ui-deprecated/utilities';

export const KEYBOARD_SHORTCUTS_GENERAL: Shortcut[] = [
  {
    label: 'Open search',
    type: ShortcutType.General,
    firstHotKey: getOsControlSymbol(),
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
