import { AGENT_CHAT_UNKNOWN_THREAD_ID } from '@/ai/constants/AgentChatUnknownThreadId';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentAIChatThreadState = createAtomState<string>({
  key: 'ai/currentAIChatThreadState',
  defaultValue: AGENT_CHAT_UNKNOWN_THREAD_ID,
});
