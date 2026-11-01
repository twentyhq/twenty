import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';

import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/AgentChatAssistantName';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';

export const getAgentChatAssistantMentionSearchResults = ({
  query,
  objectLabelSingular,
  objectLabelPlural,
}: {
  query: string;
  objectLabelSingular: string;
  objectLabelPlural: string;
}): MentionSearchResult[] =>
  AGENT_CHAT_ASSISTANT_NAME.toLowerCase().includes(query.trim().toLowerCase())
    ? [
        {
          recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
          objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
          objectLabelSingular,
          objectLabelPlural,
          label: AGENT_CHAT_ASSISTANT_NAME,
          imageUrl: '',
        },
      ]
    : [];
