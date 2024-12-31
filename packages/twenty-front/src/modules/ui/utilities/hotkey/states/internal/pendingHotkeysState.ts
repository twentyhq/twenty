import { createState } from '@ui/utilities/state/utils/createState';
import { Keys } from 'react-hotkeys-hook/dist/types';

export const pendingHotkeyState = createState<Keys | null>({
  key: 'pendingHotkeyState',
  defaultValue: null,
});
