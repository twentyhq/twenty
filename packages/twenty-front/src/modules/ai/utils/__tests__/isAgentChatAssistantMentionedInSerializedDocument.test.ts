import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { isAgentChatAssistantMentionedInSerializedDocument } from '@/ai/utils/isAgentChatAssistantMentionedInSerializedDocument';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';

const serializeParagraph = (content: ReturnType<typeof getMentionTagContent>) =>
  serializeJsonContentAsAdvancedTextEditorDocument({
    type: 'doc',
    content: [{ type: 'paragraph', content }],
  });

describe('isAgentChatAssistantMentionedInSerializedDocument', () => {
  it('finds a mention of the assistant', () => {
    expect(
      isAgentChatAssistantMentionedInSerializedDocument(
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
      isAgentChatAssistantMentionedInSerializedDocument(
        serializeParagraph(
          getMentionTagContent({
            recordId: '20202020-463f-435b-828c-107e007a2711',
            objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
            label: 'Jane Austen',
            imageUrl: '',
            shouldAddAsParticipant: true,
          }),
        ),
      ),
    ).toBe(false);
  });
});
