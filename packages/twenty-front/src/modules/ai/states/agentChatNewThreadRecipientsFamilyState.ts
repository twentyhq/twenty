import { type AgentChatNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatNewThreadRecipientsFamilyState = createAtomFamilyState<
  AgentChatNewThreadRecipients,
  string
>({
  key: 'ai/agentChatNewThreadRecipientsFamilyState',
  defaultValue: {
    isAssistantParticipant: true,
    recipientWorkspaceMemberIds: [],
  },
});
