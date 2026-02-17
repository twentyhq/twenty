import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isKeyboardShortcutMenuOpenedStateV2 = createStateV2<boolean>({
  key: 'keyboard-shortcut-menu/isKeyboardShortcutMenuOpenedStateV2',
  defaultValue: false,
});
