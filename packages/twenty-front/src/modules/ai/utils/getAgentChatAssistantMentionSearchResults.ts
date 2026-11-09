import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';

export const getAgentChatAssistantMentionSearchResults = ({
  query,
  assistantDisplayName,
  objectLabelSingular,
  objectLabelPlural,
}: {
  query: string;
  assistantDisplayName: string;
  objectLabelSingular: string;
  objectLabelPlural: string;
}): MentionSearchResult[] =>
  assistantDisplayName.toLowerCase().includes(query.trim().toLowerCase())
    ? [
        {
          recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
          objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
          objectLabelSingular,
          objectLabelPlural,
          label: assistantDisplayName,
          imageUrl: '',
        },
      ]
    : [];
