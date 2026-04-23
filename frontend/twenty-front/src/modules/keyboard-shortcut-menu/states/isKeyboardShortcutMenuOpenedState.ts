import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isKeyboardShortcutMenuOpenedState = createAtomState<boolean>({
  key: 'keyboard-shortcut-menu/isKeyboardShortcutMenuOpenedState',
  defaultValue: false,
});
