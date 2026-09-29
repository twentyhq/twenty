import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { updateAgentChatDraftDocument } from '@/ai/utils/updateAgentChatDraftDocument';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';

const COMPANY_TARGET = {
  objectNameSingular: 'company',
  recordId: '20202020-0000-4000-8000-000000000002',
};
const DOCUMENT_MENTIONING_COMPANY =
  serializeMentionTagAsAdvancedTextEditorDocument({
    ...COMPANY_TARGET,
    label: 'Acme',
  });
const UNRELATED_DOCUMENT =
  serializePlainTextAsAdvancedTextEditorDocument('What is new?');

describe('updateAgentChatDraftDocument', () => {
  it('keeps the record while its mention stays in the draft', () => {
    const serializedDocument = JSON.stringify({
      ...JSON.parse(DOCUMENT_MENTIONING_COMPANY),
      content: [
        ...JSON.parse(DOCUMENT_MENTIONING_COMPANY).content,
        { type: 'paragraph', content: [{ type: 'text', text: 'Summarize' }] },
      ],
    });

    expect(
      updateAgentChatDraftDocument({
        draft: {
          serializedDocument: DOCUMENT_MENTIONING_COMPANY,
          pendingRecordTarget: COMPANY_TARGET,
        },
        serializedDocument,
      }),
    ).toEqual({ serializedDocument, pendingRecordTarget: COMPANY_TARGET });
  });

  it('drops the record once its mention is deleted from the draft', () => {
    expect(
      updateAgentChatDraftDocument({
        draft: {
          serializedDocument: DOCUMENT_MENTIONING_COMPANY,
          pendingRecordTarget: COMPANY_TARGET,
        },
        serializedDocument: UNRELATED_DOCUMENT,
      }),
    ).toEqual({ serializedDocument: UNRELATED_DOCUMENT });
  });

  it('keeps a record waiting for a retried attach while the next message is typed', () => {
    expect(
      updateAgentChatDraftDocument({
        draft: { serializedDocument: '', pendingRecordTarget: COMPANY_TARGET },
        serializedDocument: UNRELATED_DOCUMENT,
      }),
    ).toEqual({
      serializedDocument: UNRELATED_DOCUMENT,
      pendingRecordTarget: COMPANY_TARGET,
    });
  });
});
