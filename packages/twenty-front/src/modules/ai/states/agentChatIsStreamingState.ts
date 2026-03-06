import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatIsStreamingState = createAtomState({
  key: 'agentChatIsStreamingState',
  defaultValue: false,
});
