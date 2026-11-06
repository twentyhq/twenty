import { getAgentChatPreviewPlainText } from '@/ai/utils/getAgentChatPreviewPlainText';
import { formatRecordReference } from 'twenty-shared/ai';

describe('getAgentChatPreviewPlainText', () => {
  it('keeps the assistant mention prefix and literal label punctuation', () => {
    const displayName = 'Scout [team] *helper* `Ada` 100%';
    const reference = formatRecordReference({
      objectNameSingular: 'agentChatAssistant',
      recordId: 'agentChatAssistant',
      displayName,
    });

    expect(getAgentChatPreviewPlainText(`Ask ${reference} **today**`)).toBe(
      `Ask @${displayName} today`,
    );
  });
});
