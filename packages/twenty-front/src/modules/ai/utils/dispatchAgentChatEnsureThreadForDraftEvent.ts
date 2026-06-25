import { AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME } from '@/ai/constants/AgentChatEnsureThreadForDraftEventName';

export const dispatchAgentChatEnsureThreadForDraftEvent = () => {
  window.dispatchEvent(
    new CustomEvent(AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME),
  );
};
