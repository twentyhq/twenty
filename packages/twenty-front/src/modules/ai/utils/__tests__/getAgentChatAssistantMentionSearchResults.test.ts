import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';

import { getAgentChatAssistantMentionSearchResults } from '@/ai/utils/getAgentChatAssistantMentionSearchResults';

describe('getAgentChatAssistantMentionSearchResults', () => {
  it('offers the assistant before anything is typed', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: '',
        assistantDisplayName: 'Ada',
        objectLabelSingular: 'Assistant',
        objectLabelPlural: 'Teammates',
      }).map(({ label }) => label),
    ).toEqual(['Ada']);
  });

  it('offers the assistant when its name is typed', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: 'AD',
        assistantDisplayName: 'Ada',
        objectLabelSingular: 'Assistant',
        objectLabelPlural: 'Teammates',
      }),
    ).toHaveLength(1);
  });

  it('leaves the assistant out when the name does not match', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: 'jane',
        assistantDisplayName: 'Ada',
        objectLabelSingular: 'Assistant',
        objectLabelPlural: 'Teammates',
      }),
    ).toEqual([]);
  });

  it('uses the renamed display label while preserving the canonical identity', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: 'SCOUT',
        assistantDisplayName: 'Scout Bot',
        objectLabelSingular: 'Assistant',
        objectLabelPlural: 'Teammates',
      }),
    ).toEqual([
      {
        recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        objectLabelSingular: 'Assistant',
        objectLabelPlural: 'Teammates',
        label: 'Scout Bot',
        imageUrl: '',
      },
    ]);
  });
});
