import { describe, expect, it } from 'vitest';

import { buildTeamsAssistantMessages } from 'src/features/chat/logic-functions/utils/build-teams-assistant-messages';

const INPUT = {
  requestText: 'how many open deals does Acme have?',
  history: [],
  workspaceMemberId: 'workspace-member-1',
  timeoutSeconds: 180,
  workspaceBaseUrl: 'https://acme.twenty.com',
};

const lastMessageContent = (
  messages: ReturnType<typeof buildTeamsAssistantMessages>,
): string => {
  const content = messages[messages.length - 1].content;

  return typeof content === 'string' ? content : JSON.stringify(content);
};

describe('buildTeamsAssistantMessages', () => {
  it('should tell the agent to link records to the workspace and act as the member', () => {
    const content = lastMessageContent(buildTeamsAssistantMessages(INPUT));

    expect(content).toContain(
      '[Record Name](https://acme.twenty.com/object/<objectNameSingular>/<recordId>)',
    );
    expect(content).toContain('acting as workspace member workspace-member-1');
    expect(content).toContain('killed after 180 seconds');
    expect(content).toMatch(
      /Request from Teams:\nhow many open deals does Acme have\?$/,
    );
  });

  it('should forbid record links when the workspace URL is unknown', () => {
    const content = lastMessageContent(
      buildTeamsAssistantMessages({ ...INPUT, workspaceBaseUrl: undefined }),
    );

    expect(content).toContain('never write a Twenty URL');
    expect(content).not.toContain('/object/');
  });

  it('should replay the earlier turns before the framed request', () => {
    const messages = buildTeamsAssistantMessages({
      ...INPUT,
      history: [{ requestText: 'list my companies', responseText: '**Acme**' }],
    });

    expect(messages).toEqual([
      { role: 'user', content: 'list my companies' },
      { role: 'assistant', content: '**Acme**' },
      expect.objectContaining({ role: 'user' }),
    ]);
  });
});
