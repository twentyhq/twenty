import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { isInboxDraftsByThreadId } from '@/ai/utils/isAgentChatDraftsByThreadId';

describe('isInboxDraftsByThreadId', () => {
  it('accepts empty and canonical drafts', () => {
    expect(
      isInboxDraftsByThreadId({
        empty: '',
        draft: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      }),
    ).toBe(true);
  });

  it('rejects legacy and malformed drafts', () => {
    expect(
      isInboxDraftsByThreadId({
        draft: JSON.stringify({ type: 'doc', content: [] }),
      }),
    ).toBe(false);
    expect(isInboxDraftsByThreadId({ draft: 'Hello' })).toBe(false);
    expect(isInboxDraftsByThreadId([])).toBe(false);
  });
});
