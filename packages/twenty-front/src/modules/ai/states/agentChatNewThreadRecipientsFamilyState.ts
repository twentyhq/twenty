import { INBOX_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { type InboxNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxNewThreadRecipientsFamilyState = createAtomFamilyState<
  InboxNewThreadRecipients,
  string
>({
  key: 'ai/agentChatNewThreadRecipientsFamilyState',
  defaultValue: INBOX_NEW_THREAD_DEFAULT_RECIPIENTS,
  useSessionStorage: true,
});
