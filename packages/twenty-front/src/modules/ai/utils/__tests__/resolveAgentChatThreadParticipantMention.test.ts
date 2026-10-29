import { resolveAgentChatThreadParticipantMention } from '@/ai/utils/resolveAgentChatThreadParticipantMention';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const MENTIONED_AT = '2026-10-01T10:00:00.000Z';
const LATER_MENTIONED_AT = '2026-10-01T11:00:00.000Z';

const MENTIONED_PARTICIPANT: AgentChatThreadParticipantFieldsFragment = {
  __typename: 'AgentChatThreadParticipant',
  id: 'participant-id',
  threadId: THREAD_ID,
  lastReadAt: MENTIONED_AT,
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: MENTIONED_AT,
  mentionsResolvedAt: null,
  updatedAt: MENTIONED_AT,
};

describe('resolveAgentChatThreadParticipantMention', () => {
  it('resolves the mention the member saw when answering', () => {
    expect(
      resolveAgentChatThreadParticipantMention({
        participants: { [THREAD_ID]: MENTIONED_PARTICIPANT },
        threadId: THREAD_ID,
        lastMentionedAt: MENTIONED_AT,
      })?.[THREAD_ID]?.mentionsResolvedAt,
    ).toBe(MENTIONED_AT);
  });

  it('keeps a mention that arrived after the answer pending', () => {
    expect(
      resolveAgentChatThreadParticipantMention({
        participants: {
          [THREAD_ID]: {
            ...MENTIONED_PARTICIPANT,
            lastMentionedAt: LATER_MENTIONED_AT,
          },
        },
        threadId: THREAD_ID,
        lastMentionedAt: MENTIONED_AT,
      })?.[THREAD_ID],
    ).toMatchObject({
      lastMentionedAt: LATER_MENTIONED_AT,
      mentionsResolvedAt: MENTIONED_AT,
    });
  });

  it('returns the same participants when the mention was already resolved', () => {
    const participants = {
      [THREAD_ID]: {
        ...MENTIONED_PARTICIPANT,
        mentionsResolvedAt: MENTIONED_AT,
      },
    };

    expect(
      resolveAgentChatThreadParticipantMention({
        participants,
        threadId: THREAD_ID,
        lastMentionedAt: MENTIONED_AT,
      }),
    ).toBe(participants);
  });

  it('returns the participants unchanged for a thread without a row', () => {
    const participants = {};

    expect(
      resolveAgentChatThreadParticipantMention({
        participants,
        threadId: THREAD_ID,
        lastMentionedAt: MENTIONED_AT,
      }),
    ).toBe(participants);
  });
});
