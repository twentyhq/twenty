import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type Temporal } from 'temporal-polyfill';

export const aiChatUISessionStartTimeState =
  createAtomState<Temporal.Instant | null>({
    key: 'aiChatUISessionStartTimeState',
    defaultValue: null,
  });
