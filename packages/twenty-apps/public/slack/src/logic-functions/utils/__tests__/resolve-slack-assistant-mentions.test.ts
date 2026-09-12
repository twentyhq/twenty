import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackMentionLabel } from 'src/logic-functions/types/slack-mention-label.type';
import { resolveSlackAssistantMentions } from 'src/logic-functions/utils/resolve-slack-assistant-mentions';

const { resolveSlackMentionLabelsMock } = vi.hoisted(() => ({
  resolveSlackMentionLabelsMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/resolve-slack-mention-labels', () => ({
  resolveSlackMentionLabels: resolveSlackMentionLabelsMock,
}));

const client = {} as CoreApiClient;
const slackClient = {} as WebClient;

const ALICE: SlackMentionLabel = {
  label: '@Alice Martin (workspace member member-1)',
  name: 'Alice Martin',
};
const BOB: SlackMentionLabel = {
  label: '@Bob Lee (membership not confirmed)',
  name: 'Bob Lee',
};
const ASSISTANT: SlackMentionLabel = { label: 'you', name: undefined };

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
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    resolveSlackMentionLabelsMock.mockResolvedValue(
      new Map([
        ['U04ABC', ALICE],
        ['U05DEF', BOB],
        ['UBOT', ASSISTANT],
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

  it('should name a history author without claiming anything about their membership', async () => {
    const resolved = await resolve('and who owns Acme?', [
      { role: 'user', content: '<@U04ABC>: ask <@U05DEF> about Acme' },
      { role: 'assistant', content: 'Acme is a company record.' },
    ]);

    expect(resolved.conversationMessages).toEqual([
      {
        role: 'user',
        content:
          '@Alice Martin: ask @Bob Lee (membership not confirmed) about Acme',
      },
      { role: 'assistant', content: 'Acme is a company record.' },
    ]);
  });

  it('should name a history author the app could not resolve', async () => {
    resolveSlackMentionLabelsMock.mockResolvedValue(new Map());

    const resolved = await resolve('and who owns Acme?', [
      { role: 'user', content: '<@U0GHOST>: I do' },
    ]);

    expect(resolved.conversationMessages[0].content).toBe(
      '@unknown Slack user U0GHOST: I do',
    );
  });

  it('should read a history turn the assistant itself wrote as you', async () => {
    const resolved = await resolve('and who owns Acme?', [
      { role: 'user', content: '<@UBOT>: Acme is owned by Alice' },
    ]);

    expect(resolved.conversationMessages[0].content).toBe(
      'you: Acme is owned by Alice',
    );
  });

  it('should not report mentioned users when only history authors were resolved', async () => {
    const resolved = await resolve('how many open deals does Acme have?', [
      { role: 'user', content: '<@U04ABC>: good question' },
    ]);

    expect(resolved.hasMentionedUsers).toBe(false);
    expect(resolved.conversationMessages[0].content).toBe(
      '@Alice Martin: good question',
    );
  });

  it('should look up history authors and in-text mentions in one batch', async () => {
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

    expect(resolved.requestText).toBe('you what is up?');
    expect(resolved.hasMentionedUsers).toBe(false);
  });

  it('should not look anything up when there is no mention', async () => {
    resolveSlackMentionLabelsMock.mockResolvedValue(new Map());

    const resolved = await resolve('how many open opportunities do we have?');

    expect(resolveSlackMentionLabelsMock).toHaveBeenCalledWith(
      expect.objectContaining({ slackUserIds: [] }),
    );
    expect(resolved.requestText).toBe(
      'how many open opportunities do we have?',
    );
    expect(resolved.hasMentionedUsers).toBe(false);
  });

  it('should keep the raw text when resolution outlives its timeout', async () => {
    vi.useFakeTimers();
    resolveSlackMentionLabelsMock.mockReturnValue(new Promise(() => undefined));

    const resolving = resolve('ask <@U04ABC> about Acme');

    await vi.advanceTimersByTimeAsync(5_000);

    const resolved = await resolving;

    expect(resolved.requestText).toBe('ask <@U04ABC> about Acme');
    expect(resolved.hasMentionedUsers).toBe(false);
  });

  it('should keep the raw text when resolution fails', async () => {
    resolveSlackMentionLabelsMock.mockRejectedValue(new Error('boom'));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const resolved = await resolve('ask <@U04ABC> about Acme');

    expect(resolved.requestText).toBe('ask <@U04ABC> about Acme');
  });
});
