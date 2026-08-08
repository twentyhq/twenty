import { describe, expect, it } from 'vitest';

import { buildSlackAssistantMessages } from 'src/logic-functions/utils/build-slack-assistant-messages';

describe('buildSlackAssistantMessages', () => {
  it('should return a single user message when there is no conversation history', () => {
    const messages = buildSlackAssistantMessages({
      requestText: 'How many open opportunities does ACME have?',
      requesterName: 'Jane',
      conversationMessages: undefined,
      timeoutSeconds: 300,
      workspaceBaseUrl: 'https://acme.twenty.com',
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toContain('killed after 300 seconds');
    expect(messages[0].content).not.toContain('recent Slack history');
    expect(messages[0].content).toContain(
      '[Record Name](https://acme.twenty.com/object/<objectNameSingular>/<recordId>)',
    );
    expect(messages[0].content).toContain(
      'Jane asks from Slack:\nHow many open opportunities does ACME have?',
    );
  });

  it('should prepend conversation history as prior turns before the request', () => {
    const messages = buildSlackAssistantMessages({
      requestText: 'And who owns it?',
      requesterName: 'Jane',
      conversationMessages: [
        { role: 'user', content: '<@U123>: Find the ACME account' },
        { role: 'assistant', content: 'ACME is a company record.' },
      ],
      timeoutSeconds: 300,
      workspaceBaseUrl: 'https://acme.twenty.com',
    });

    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual({
      role: 'user',
      content: '<@U123>: Find the ACME account',
    });
    expect(messages[1]).toEqual({
      role: 'assistant',
      content: 'ACME is a company record.',
    });
    expect(messages[2].role).toBe('user');
    expect(messages[2].content).toContain(
      'recent Slack history for context only',
    );
    expect(messages[2].content).toContain(
      'Jane asks from Slack:\nAnd who owns it?',
    );
  });

  it('should fall back to a generic requester name and warn about missing record links', () => {
    const messages = buildSlackAssistantMessages({
      requestText: 'List my tasks',
      requesterName: undefined,
      conversationMessages: [],
      timeoutSeconds: 120,
      workspaceBaseUrl: undefined,
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].content).toContain(
      'A team member asks from Slack:\nList my tasks',
    );
    expect(messages[0].content).toContain(
      'record links are unavailable',
    );
  });
});
