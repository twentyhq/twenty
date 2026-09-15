import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { isAgentChatDraftsByThreadId } from '@/ai/utils/isAgentChatDraftsByThreadId';

describe('isAgentChatDraftsByThreadId', () => {
  it('accepts empty and canonical drafts', () => {
    expect(
      isAgentChatDraftsByThreadId({
        empty: '',
        draft: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      }),
    ).toBe(true);
  });

  it('rejects legacy and malformed drafts', () => {
    expect(
      isAgentChatDraftsByThreadId({
        draft: JSON.stringify({ type: 'doc', content: [] }),
      }),
    ).toBe(false);
    expect(isAgentChatDraftsByThreadId({ draft: 'Hello' })).toBe(false);
    expect(isAgentChatDraftsByThreadId([])).toBe(false);
  });
});
