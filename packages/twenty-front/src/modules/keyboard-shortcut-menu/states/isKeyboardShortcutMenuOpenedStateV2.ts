import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isKeyboardShortcutMenuOpenedStateV2 = createAtomState<boolean>({
  key: 'keyboard-shortcut-menu/isKeyboardShortcutMenuOpenedStateV2',
  defaultValue: false,
});
