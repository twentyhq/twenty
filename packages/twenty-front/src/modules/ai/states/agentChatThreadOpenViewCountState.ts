import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// A record page chat and the side panel can show the thread at the same time
export const agentChatThreadOpenViewCountState = createAtomState<number>({
  key: 'ai/agentChatThreadOpenViewCountState',
  defaultValue: 0,
});
