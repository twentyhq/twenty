import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { isAgentChatDraftsByThreadId } from '@/ai/utils/isAgentChatDraftsByThreadId';

describe('isAgentChatDraftsByThreadId', () => {
  it('accepts empty and canonical drafts, with or without a pending record', () => {
    expect(
      isAgentChatDraftsByThreadId({
        empty: { serializedDocument: '' },
        draft: {
          serializedDocument:
            serializePlainTextAsAdvancedTextEditorDocument('Hello'),
        },
        fromRecord: {
          serializedDocument:
            serializePlainTextAsAdvancedTextEditorDocument('Hello'),
          pendingRecordTarget: {
            objectNameSingular: 'company',
            recordId: '20202020-0000-4000-8000-000000000002',
          },
        },
      }),
    ).toBe(true);
  });

  it('rejects legacy and malformed drafts', () => {
    expect(
      isAgentChatDraftsByThreadId({
        draft: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      }),
    ).toBe(false);
    expect(
      isAgentChatDraftsByThreadId({
        draft: {
          serializedDocument: JSON.stringify({ type: 'doc', content: [] }),
        },
      }),
    ).toBe(false);
    expect(
      isAgentChatDraftsByThreadId({
        draft: {
          serializedDocument: '',
          pendingRecordTarget: { objectNameSingular: 'company' },
        },
      }),
    ).toBe(false);
    expect(isAgentChatDraftsByThreadId([])).toBe(false);
  });
});
