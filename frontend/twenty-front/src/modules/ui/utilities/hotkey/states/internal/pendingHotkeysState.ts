import { type Keys } from 'react-hotkeys-hook/dist/types';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const pendingHotkeyState = createAtomState<Keys | null>({
  key: 'pendingHotkeyState',
  defaultValue: null,
});
