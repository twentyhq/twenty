import { describe, expect, it } from 'vitest';

import { getLinkedinHistoryImportChatJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';

const JOB_ID_PATTERN = /^[\w.-]{1,128}$/;

const RUN_ID = '6f2be692-d35f-4dce-8d78-ee1464ed367e';

const buildChat = (chatId: string) => ({
  id: chatId,
  name: 'Ada Lovelace',
  is_group: false,
  is_1to1: true,
});

describe('getLinkedinHistoryImportChatJobId', () => {
  it.each([
    'chat_7f3a',
    'urn:li:msg_conversation:(urn:li:fsd_profile:ACoAA,2-ZDk0MzE5NmYtYzA1Mi00NDE2LWE0ZjktYjcwMDE0MjBiZmQ0XzAxMA==)',
    'x'.repeat(300),
  ])('builds a queue-compatible job id for the chat id %s', (chatId) => {
    const contactsJobId = getLinkedinHistoryImportChatJobId({
      kind: 'CONTACTS',
      payload: {
        connectedAccountId: 'connection-id',
        runId: RUN_ID,
        chat: buildChat(chatId),
        attempt: 12,
      },
    });
    const messagesJobId = getLinkedinHistoryImportChatJobId({
      kind: 'MESSAGES',
      payload: {
        connectedAccountId: 'connection-id',
        runId: RUN_ID,
        chat: buildChat(chatId),
        counterparts: [],
        personIdByHandle: {},
        pageIndex: 9999,
        attempt: 12,
      },
    });

    expect(contactsJobId).toMatch(JOB_ID_PATTERN);
    expect(messagesJobId).toMatch(JOB_ID_PATTERN);
  });

  it('keeps the same job id for the same conversation and distinct ones across conversations', () => {
    const buildJobId = (chatId: string) =>
      getLinkedinHistoryImportChatJobId({
        kind: 'CONTACTS',
        payload: {
          connectedAccountId: 'connection-id',
          runId: RUN_ID,
          chat: buildChat(chatId),
        },
      });

    expect(buildJobId('chat-1')).toBe(buildJobId('chat-1'));
    expect(buildJobId('chat-1')).not.toBe(buildJobId('chat-2'));
  });
});
