import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';

export const getAgentChatThreadAtoms = (threadId: string) => {
  const componentFamilyKey = {
    instanceId: AGENT_CHAT_INSTANCE_ID,
    familyKey: { threadId },
  };

  return {
    messagesAtom:
      agentChatMessagesComponentFamilyState.atomFamily(componentFamilyKey),
    errorAtom:
      agentChatErrorComponentFamilyState.atomFamily(componentFamilyKey),
    isAwaitingFirstChunkAtom:
      agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily(
        componentFamilyKey,
      ),
  };
};
