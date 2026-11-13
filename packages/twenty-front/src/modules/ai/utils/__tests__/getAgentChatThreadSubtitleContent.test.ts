import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAiChatThreadSubtitleContent } from '@/ai/utils/getAgentChatThreadSubtitleContent';

const buildThread = (
  thread: Partial<AiChatThreadRecord> = {},
): AiChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id: 'thread',
  title: 'Renewal prep',
  deletedAt: null,
  createdAt: '2026-10-28T10:00:00.000Z',
  updatedAt: '2026-10-28T10:00:00.000Z',
  ...thread,
});

const getContent = ({
  thread = buildThread(),
  draftPreviewText,
}: {
  thread?: AiChatThreadRecord;
  draftPreviewText?: string;
}) =>
  getAiChatThreadSubtitleContent({
    thread,
    draftPreviewText,
    workspaceMembers: [],
    currentWorkspaceMemberId: undefined,
    assistantDisplayName: 'Scout',
  });

describe('getAiChatThreadSubtitleContent', () => {
  it('has no content without a message, draft or pending question', () => {
    expect(getContent({})).toEqual({
      isAwaitingAnswer: false,
      hasDraft: false,
      previewText: null,
      hasContent: false,
    });
  });

  it('previews the draft over the last message', () => {
    expect(
      getContent({
        thread: buildThread({ lastMessageText: 'Sent earlier' }),
        draftPreviewText: 'Unsent reply',
      }),
    ).toMatchObject({
      hasDraft: true,
      previewText: 'Unsent reply',
      hasContent: true,
    });
  });

  it('has content while a question awaits an answer', () => {
    expect(
      getContent({
        thread: buildThread({ pendingQuestionMessageId: 'question' }),
      }),
    ).toMatchObject({ isAwaitingAnswer: true, hasContent: true });
  });

  it('ignores a pending question on a deleted conversation', () => {
    expect(
      getContent({
        thread: buildThread({
          pendingQuestionMessageId: 'question',
          deletedAt: '2026-10-28T11:00:00.000Z',
        }),
      }),
    ).toMatchObject({ isAwaitingAnswer: false, hasContent: false });
  });
});
