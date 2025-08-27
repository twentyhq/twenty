import { type Keys } from 'react-hotkeys-hook/dist/types';
import { createState } from 'twenty-ui/utilities';

export const pendingHotkeyState = createState<Keys | null>({
  key: 'pendingHotkeyState',
  defaultValue: null,
});
