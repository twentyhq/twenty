import { getAgentChatMessageQuoteSource } from '@/ai/utils/getAgentChatMessageQuoteSource';

const JULIA = {
  id: 'julia-id',
  name: { firstName: 'Julia', lastName: 'Martin' },
  userEmail: 'julia@example.com',
};

describe('getAgentChatMessageQuoteSource', () => {
  it('names the sender and keeps what they said', () => {
    expect(
      getAgentChatMessageQuoteSource({
        message: {
          parts: [
            {
              type: 'text',
              text: '> **Marco Rossi:** Can you take Stripe?\n\nOn it.',
            },
          ],
          metadata: { senderWorkspaceMemberId: JULIA.id },
        },
        workspaceMembers: [JULIA],
      }),
    ).toEqual({ sender: JULIA, authorName: 'Julia Martin', excerpt: 'On it.' });
  });

  it('labels a sender who left the workspace', () => {
    expect(
      getAgentChatMessageQuoteSource({
        message: {
          parts: [{ type: 'text', text: 'On it.' }],
          metadata: { senderWorkspaceMemberId: 'former-member-id' },
        },
        workspaceMembers: [JULIA],
      }),
    ).toEqual({
      sender: undefined,
      authorName: 'Former member',
      excerpt: 'On it.',
    });
  });
});
