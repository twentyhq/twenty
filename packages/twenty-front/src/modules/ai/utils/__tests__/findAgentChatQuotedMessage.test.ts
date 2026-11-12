import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { findAgentChatQuotedMessage } from '@/ai/utils/findAgentChatQuotedMessage';

const JULIA = {
  id: 'julia-id',
  name: { firstName: 'Julia', lastName: 'Martin' },
  userEmail: 'julia@example.com',
};

const MARCO = {
  id: 'marco-id',
  name: { firstName: 'Marco', lastName: 'Rossi' },
  userEmail: 'marco@example.com',
};

const buildMessage = ({
  id,
  text,
  senderWorkspaceMemberId = JULIA.id,
  role = 'user',
}: {
  id: string;
  text: string;
  senderWorkspaceMemberId?: string;
  role?: ExtendedUIMessage['role'];
}): ExtendedUIMessage => ({
  id,
  role,
  parts: [{ type: 'text', text }],
  metadata: { createdAt: '2026-10-15T08:00:00.000Z', senderWorkspaceMemberId },
});

const REPLY = buildMessage({
  id: 'reply',
  text: '> **Julia Martin:** On it.\n\nThanks!',
  senderWorkspaceMemberId: MARCO.id,
});

const QUOTE = { authorName: 'Julia Martin', excerpt: 'On it.' };

const findQuotedMessageId = (messages: ExtendedUIMessage[]) =>
  findAgentChatQuotedMessage({
    messages,
    replyMessageId: REPLY.id,
    quote: QUOTE,
    workspaceMembers: [JULIA, MARCO],
  })?.id;

describe('findAgentChatQuotedMessage', () => {
  it('finds the quoted message', () => {
    expect(
      findQuotedMessageId([
        buildMessage({ id: 'original', text: 'On it.' }),
        REPLY,
      ]),
    ).toBe('original');
  });

  it('finds nothing when no earlier message has the quoted text', () => {
    expect(
      findQuotedMessageId([
        buildMessage({ id: 'other', text: 'Not yet.' }),
        REPLY,
      ]),
    ).toBeUndefined();
  });

  it('skips a message with the quoted text from another author', () => {
    expect(
      findQuotedMessageId([
        buildMessage({ id: 'original', text: 'On it.' }),
        buildMessage({
          id: 'other-author',
          text: 'On it.',
          senderWorkspaceMemberId: MARCO.id,
        }),
        REPLY,
      ]),
    ).toBe('original');
  });

  it('matches a sender who left by the quoted text alone', () => {
    expect(
      findQuotedMessageId([
        buildMessage({
          id: 'original',
          text: 'On it.',
          senderWorkspaceMemberId: 'former-member-id',
        }),
        REPLY,
      ]),
    ).toBe('original');
  });

  it('picks the latest earlier match', () => {
    expect(
      findQuotedMessageId([
        buildMessage({ id: 'first', text: 'On it.' }),
        buildMessage({ id: 'second', text: 'On it.' }),
        REPLY,
      ]),
    ).toBe('second');
  });

  it('ignores messages sent after the reply', () => {
    expect(
      findQuotedMessageId([
        buildMessage({ id: 'original', text: 'On it.' }),
        REPLY,
        buildMessage({ id: 'later', text: 'On it.' }),
      ]),
    ).toBe('original');
  });

  it('ignores assistant messages', () => {
    expect(
      findQuotedMessageId([
        buildMessage({ id: 'assistant', text: 'On it.', role: 'assistant' }),
        REPLY,
      ]),
    ).toBeUndefined();
  });
});
