import { getAgentChatAssistantMentionSearchResults } from '@/ai/utils/getAgentChatAssistantMentionSearchResults';

describe('getAgentChatAssistantMentionSearchResults', () => {
  it('offers the assistant before anything is typed', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: '',
        objectLabelSingular: 'Assistant',
        objectLabelPlural: 'Teammates',
      }).map(({ label }) => label),
    ).toEqual(['Ada']);
  });

  it('offers the assistant when its name is typed', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: 'AD',
        objectLabelSingular: 'Assistant',
        objectLabelPlural: 'Teammates',
      }),
    ).toHaveLength(1);
  });

  it('leaves the assistant out when the name does not match', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: 'jane',
        objectLabelSingular: 'Assistant',
        objectLabelPlural: 'Teammates',
      }),
    ).toEqual([]);
  });
});
