import { isAgentChatThreadInFilterStatus } from '@/ai/utils/isAgentChatThreadInFilterStatus';

const OPEN_STATUS = {
  scope: 'INBOX',
  isMentioned: false,
  isAssignedToMe: false,
} as const;

describe('isAgentChatThreadInFilterStatus', () => {
  it('lists open chats under Open', () => {
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: OPEN_STATUS,
        filterStatus: 'active',
      }),
    ).toBe(true);
  });

  it('lists open chats waiting on an answer under Needs input', () => {
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: OPEN_STATUS,
        filterStatus: 'needsInput',
      }),
    ).toBe(true);
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: OPEN_STATUS,
        filterStatus: 'needsInput',
      }),
    ).toBe(false);
  });

  it('lists open chats the member was mentioned in under Mentions', () => {
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: { ...OPEN_STATUS, isMentioned: true },
        filterStatus: 'mentions',
      }),
    ).toBe(true);
  });

  it('lists open chats assigned to the member under Assigned', () => {
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: { ...OPEN_STATUS, isAssignedToMe: true },
        filterStatus: 'assigned',
      }),
    ).toBe(true);
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: OPEN_STATUS,
        filterStatus: 'assigned',
      }),
    ).toBe(false);
  });

  it('leaves done chats out of the views narrowing Open', () => {
    const doneStatus = {
      scope: 'ARCHIVED',
      isMentioned: true,
      isAssignedToMe: true,
    } as const;

    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: doneStatus,
        filterStatus: 'needsInput',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: doneStatus,
        filterStatus: 'mentions',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: doneStatus,
        filterStatus: 'assigned',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInFilterStatus({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: doneStatus,
        filterStatus: 'done',
      }),
    ).toBe(true);
  });
});
