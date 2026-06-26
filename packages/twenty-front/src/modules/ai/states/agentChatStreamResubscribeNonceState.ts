import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatStreamResubscribeNonceState = createAtomState<number>({
  key: 'agentChatStreamResubscribeNonceState',
  defaultValue: 0,
});
