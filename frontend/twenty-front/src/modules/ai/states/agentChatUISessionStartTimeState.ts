import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type Temporal } from 'temporal-polyfill';

export const agentChatUISessionStartTimeState =
  createAtomState<Temporal.Instant | null>({
    key: 'agentChatUISessionStartTimeState',
    defaultValue: null,
  });
