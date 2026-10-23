import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatNewThreadChannelIdState = createAtomState<string | null>({
  key: 'ai/agentChatNewThreadChannelIdState',
  defaultValue: null,
});
