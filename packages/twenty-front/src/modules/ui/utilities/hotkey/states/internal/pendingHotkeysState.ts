import { type Keys } from 'react-hotkeys-hook/dist/types';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const pendingHotkeyState = createStateV2<Keys | null>({
  key: 'pendingHotkeyState',
  defaultValue: null,
});
