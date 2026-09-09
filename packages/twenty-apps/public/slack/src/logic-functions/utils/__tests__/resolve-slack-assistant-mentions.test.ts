import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackAssistantMentions } from 'src/logic-functions/utils/resolve-slack-assistant-mentions';

const { resolveSlackMentionLabelsMock } = vi.hoisted(() => ({
  resolveSlackMentionLabelsMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/resolve-slack-mention-labels', () => ({
  resolveSlackMentionLabels: resolveSlackMentionLabelsMock,
}));

const client = {} as CoreApiClient;
const slackClient = {} as WebClient;

const resolve = (
  requestText: string,
  conversationMessages: {
    role: 'user' | 'assistant';
    content: string;
  }[] = [],
) =>
  resolveSlackAssistantMentions({
    requestText,
    conversationMessages,
    client,
    slackClient,
    assistantBotUserId: 'UBOT',
  });

describe('resolveSlackAssistantMentions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveSlackMentionLabelsMock.mockResolvedValue(
      new Map([
        ['U04ABC', '@Alice Martin (workspace member member-1)'],
        ['U05DEF', '@Bob Lee (no Twenty workspace member)'],
      ]),
    );
  });

  it('should resolve mentions in the live request', async () => {
    const resolved = await resolve('create a follow-up task for <@U04ABC>');

    expect(resolved.requestText).toBe(
      'create a follow-up task for @Alice Martin (workspace member member-1)',
    );
    expect(resolved.hasMentionedUsers).toBe(true);
  });

  it('should resolve the author prefix and the mentions of replayed history', async () => {
    const resolved = await resolve('and who owns Acme?', [
      { role: 'user', content: '<@U04ABC>: ask <@U05DEF> about Acme' },
      { role: 'assistant', content: 'Acme is a company record.' },
    ]);

    expect(resolved.conversationMessages).toEqual([
      {
        role: 'user',
        content:
          '@Alice Martin (workspace member member-1): ask @Bob Lee (no Twenty workspace member) about Acme',
      },
      { role: 'assistant', content: 'Acme is a company record.' },
    ]);
  });

  it('should collect the ids of the request and the history in one lookup', async () => {
    await resolve('ask <@U04ABC>', [
      { role: 'user', content: '<@U05DEF>: on it' },
    ]);

    expect(resolveSlackMentionLabelsMock).toHaveBeenCalledTimes(1);
    expect(resolveSlackMentionLabelsMock).toHaveBeenCalledWith({
      slackUserIds: ['U04ABC', 'U05DEF'],
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });
  });

  it('should not report mentioned users when only the assistant is mentioned', async () => {
    const resolved = await resolve('<@UBOT> what is up?');

    expect(resolved.hasMentionedUsers).toBe(false);
  });

  it('should not look anything up when there is no mention', async () => {
    const resolved = await resolve('how many open opportunities do we have?');

    expect(resolveSlackMentionLabelsMock).toHaveBeenCalledWith(
      expect.objectContaining({ slackUserIds: [] }),
    );
    expect(resolved.requestText).toBe(
      'how many open opportunities do we have?',
    );
    expect(resolved.hasMentionedUsers).toBe(false);
  });

  it('should keep the raw text when resolution fails', async () => {
    resolveSlackMentionLabelsMock.mockRejectedValue(new Error('boom'));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const resolved = await resolve('ask <@U04ABC> about Acme');

    expect(resolved.requestText).toBe('ask <@U04ABC> about Acme');
  });
});
