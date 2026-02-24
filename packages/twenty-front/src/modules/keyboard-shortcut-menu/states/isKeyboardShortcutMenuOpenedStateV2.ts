import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isKeyboardShortcutMenuOpenedStateV2 = createState<boolean>({
  key: 'keyboard-shortcut-menu/isKeyboardShortcutMenuOpenedStateV2',
  defaultValue: false,
});
