import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatSubscriptionDisposeState = createAtomState<
  (() => void) | null
>({
  key: 'agentChatSubscriptionDisposeState',
  defaultValue: null,
});
