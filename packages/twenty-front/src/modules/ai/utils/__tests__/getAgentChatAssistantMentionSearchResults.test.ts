import { getAgentChatAssistantMentionSearchResults } from '@/ai/utils/getAgentChatAssistantMentionSearchResults';

describe('getAgentChatAssistantMentionSearchResults', () => {
  it('offers the assistant before anything is typed', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: '',
        objectLabel: 'Assistant',
      }).map(({ label }) => label),
    ).toEqual(['Ada']);
  });

  it('offers the assistant when its name is typed', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: 'AD',
        objectLabel: 'Assistant',
      }),
    ).toHaveLength(1);
  });

  it('leaves the assistant out when the name does not match', () => {
    expect(
      getAgentChatAssistantMentionSearchResults({
        query: 'jane',
        objectLabel: 'Assistant',
      }),
    ).toEqual([]);
  });
});
