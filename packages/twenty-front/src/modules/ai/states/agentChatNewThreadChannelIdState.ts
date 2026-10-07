import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The channel a new chat is created in, picked when it was started
export const agentChatNewThreadChannelIdState = createAtomState<string | null>({
  key: 'ai/agentChatNewThreadChannelIdState',
  defaultValue: null,
});
