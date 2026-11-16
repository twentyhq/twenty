import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { isAiChatAssistantMentionedInSerializedDocument } from '@/ai/utils/isAiChatAssistantMentionedInSerializedDocument';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';

const serializeParagraph = (content: ReturnType<typeof getMentionTagContent>) =>
  serializeJsonContentAsAdvancedTextEditorDocument({
    type: 'doc',
    content: [{ type: 'paragraph', content }],
  });

describe('isAiChatAssistantMentionedInSerializedDocument', () => {
  it('finds a mention of the assistant', () => {
    expect(
      isAiChatAssistantMentionedInSerializedDocument(
        serializeParagraph(
          getMentionTagContent({
            recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
            objectNameSingular:
              AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
            label: 'Ada',
            imageUrl: '',
            shouldAddAsParticipant: false,
          }),
        ),
      ),
    ).toBe(true);
  });

  it('ignores mentions of teammates', () => {
    expect(
      isAiChatAssistantMentionedInSerializedDocument(
        serializeParagraph(
          getMentionTagContent({
            recordId: '20202020-463f-435b-828c-107e007a2711',
            objectNameSingular: StandardObjectNameSingular.WorkspaceMember,
            label: 'Jane Austen',
            imageUrl: '',
            shouldAddAsParticipant: true,
          }),
        ),
      ),
    ).toBe(false);
  });
});
