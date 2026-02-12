import { type Keys } from 'react-hotkeys-hook/dist/types';
import { createState } from '@/ui/utilities/state/utils/createState';

export const pendingHotkeyState = createState<Keys | null>({
  key: 'pendingHotkeyState',
  defaultValue: null,
});
