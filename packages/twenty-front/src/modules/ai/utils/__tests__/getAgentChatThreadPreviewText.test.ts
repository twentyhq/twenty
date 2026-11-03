import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';

const MEMBERS = [
  {
    id: 'me',
    name: { firstName: 'Jane', lastName: 'Doe' },
    userEmail: 'jane@apple.dev',
  },
  {
    id: 'teammate',
    name: { firstName: 'Tim', lastName: 'Apple' },
    userEmail: 'tim@apple.dev',
  },
] as never;

const getText = (
  lastMessageSenderWorkspaceMemberId: string | null,
  lastMessageText = 'Legal is   reviewing\nthe terms',
) =>
  getAgentChatThreadPreviewText({
    thread: { lastMessageText, lastMessageSenderWorkspaceMemberId },
    workspaceMembers: MEMBERS,
    currentWorkspaceMemberId: 'me',
  });

describe('getAgentChatThreadPreviewText', () => {
  it('names the member who wrote the last message', () => {
    expect(getText('teammate')).toBe('Tim Apple: Legal is reviewing the terms');
  });

  it('reads the current member as You', () => {
    expect(getText('me')).toBe('You: Legal is reviewing the terms');
  });

  it('shows an agent reply as plain text', () => {
    expect(getText(null)).toBe('Legal is reviewing the terms');
  });

  it('shows nothing without text', () => {
    expect(getText('teammate', '  ')).toBeNull();
  });

  it('reads chat references and markdown as plain text', () => {
    expect(
      getText(
        null,
        '## Ready\n- Linked to [[record:company:20202020-a305-41e7-8c72-ba44072a4c58:Airbnb]] **today**',
      ),
    ).toBe('Ready Linked to Airbnb today');
  });

  it('keeps replacement patterns in a reference name as written', () => {
    expect(
      getText(
        null,
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:A$&B $$ Co]] next',
      ),
    ).toBe('Contact A$&B $$ Co next');
  });
});

describe('authoritative projected sender', () => {
  const rowMetadata = {
    threadId: 'thread',
    activityAt: null,
    pendingQuestionMessageId: null,
    messageId: 'message',
    previewText: 'Three deals moved to Proposal',
    senderType: 'workflow',
    senderId: 'workflow',
    senderName: 'Pipeline digest',
    executionOutcome: null,
  } as const;

  it('names the workflow independently of an old member preview field', () => {
    expect(
      getAgentChatThreadPreviewText({
        thread: {
          lastMessageText: 'Three deals moved to Proposal',
          lastMessageSenderWorkspaceMemberId: 'me',
        },
        workspaceMembers: MEMBERS,
        currentWorkspaceMemberId: 'me',
        rowMetadata,
      }),
    ).toBe('Pipeline digest: Three deals moved to Proposal');
  });

  it('uses a neutral application label when its name is unavailable', () => {
    expect(
      getAgentChatThreadPreviewText({
        thread: { lastMessageText: 'Review this update' },
        workspaceMembers: MEMBERS,
        currentWorkspaceMemberId: 'me',
        rowMetadata: {
          ...rowMetadata,
          senderType: 'application',
          senderName: null,
          previewText: 'Review this update',
        },
      }),
    ).toBe('Application: Review this update');
  });
  it('never attaches an older cached text to a tool-only projected sender', () => {
    expect(
      getAgentChatThreadPreviewText({
        thread: {
          lastMessageText: 'Old text',
          lastMessageSenderWorkspaceMemberId: 'me',
        },
        workspaceMembers: MEMBERS,
        currentWorkspaceMemberId: 'me',
        rowMetadata: { ...rowMetadata, previewText: null },
      }),
    ).toBeNull();
  });
});
