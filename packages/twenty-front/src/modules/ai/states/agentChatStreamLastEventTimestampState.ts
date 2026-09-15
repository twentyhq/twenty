import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatStreamLastEventTimestampState = createAtomState<
  number | null
>({
  key: 'agentChatStreamLastEventTimestampState',
  defaultValue: null,
});
