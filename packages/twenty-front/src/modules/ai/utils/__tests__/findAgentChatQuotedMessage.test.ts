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
  role = 'user',
  metadata = { senderWorkspaceMemberId: JULIA.id },
}: {
  id: string;
  text: string;
  role?: ExtendedUIMessage['role'];
  metadata?: ExtendedUIMessage['metadata'];
}): ExtendedUIMessage => ({
  id,
  role,
  parts: [{ type: 'text', text }],
  metadata: { createdAt: '2026-10-15T08:00:00.000Z', ...metadata },
});

const REPLY = buildMessage({
  id: 'reply',
  text: '> **Julia Martin:** On it.\n\nThanks!',
  metadata: { senderWorkspaceMemberId: MARCO.id },
});

const QUOTE = { authorName: 'Julia Martin', excerpt: 'On it.' };

const findQuotedMessageId = (
  messages: ExtendedUIMessage[],
  quote: { authorName: string; excerpt: string } = QUOTE,
) =>
  findAgentChatQuotedMessage({
    messages,
    replyMessageId: REPLY.id,
    quote,
    authorContext: {
      workspaceMembers: [JULIA, MARCO],
      assistantDisplayName: 'Ada',
      currentWorkspace: null,
    },
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
          metadata: { senderWorkspaceMemberId: MARCO.id },
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
          metadata: { senderWorkspaceMemberId: 'former-member-id' },
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

  it('finds a message from the built-in assistant by its name', () => {
    const assistantMessage = buildMessage({
      id: 'assistant',
      text: 'On it.',
      role: 'assistant',
      metadata: { isBuiltInAssistant: true },
    });

    expect(
      findQuotedMessageId([assistantMessage, REPLY], {
        authorName: 'Ada',
        excerpt: 'On it.',
      }),
    ).toBe('assistant');
    expect(findQuotedMessageId([assistantMessage, REPLY])).toBeUndefined();
  });

  it('finds an agent message by the quoted text alone', () => {
    expect(
      findQuotedMessageId(
        [
          buildMessage({
            id: 'agent',
            text: 'On it.',
            role: 'assistant',
            metadata: { agentId: 'agent-id' },
          }),
          REPLY,
        ],
        { authorName: 'Sales agent', excerpt: 'On it.' },
      ),
    ).toBe('agent');
  });

  it('finds a message without text from an empty excerpt', () => {
    expect(
      findQuotedMessageId(
        [
          buildMessage({ id: 'original', text: 'On it.' }),
          {
            id: 'tool-only',
            role: 'assistant',
            parts: [
              {
                type: 'tool-find_companies',
                toolCallId: 'call-1',
                state: 'output-available',
                input: {},
                output: {},
              },
            ],
            metadata: { isBuiltInAssistant: true },
          },
          REPLY,
        ],
        { authorName: 'Ada', excerpt: '' },
      ),
    ).toBe('tool-only');
  });
});
