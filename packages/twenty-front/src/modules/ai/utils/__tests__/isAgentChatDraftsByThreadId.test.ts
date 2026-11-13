import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { isAiChatDraftsByThreadId } from '@/ai/utils/isAgentChatDraftsByThreadId';

describe('isAiChatDraftsByThreadId', () => {
  it('accepts empty and canonical drafts', () => {
    expect(
      isAiChatDraftsByThreadId({
        empty: '',
        draft: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      }),
    ).toBe(true);
  });

  it('rejects legacy and malformed drafts', () => {
    expect(
      isAiChatDraftsByThreadId({
        draft: JSON.stringify({ type: 'doc', content: [] }),
      }),
    ).toBe(false);
    expect(isAiChatDraftsByThreadId({ draft: 'Hello' })).toBe(false);
    expect(isAiChatDraftsByThreadId([])).toBe(false);
  });
});
