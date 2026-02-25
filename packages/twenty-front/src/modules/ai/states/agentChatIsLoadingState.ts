import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatIsLoadingState = createAtomState({
  key: 'ai/agentChatIsLoadingState',
  defaultValue: false,
});
