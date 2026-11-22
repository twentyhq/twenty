import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { areAiChatMessagesGrouped } from '@/ai-chat/messages/utils/areAiChatMessagesGrouped';

const buildMessage = ({
  role = 'user',
  senderWorkspaceMemberId = 'member',
  createdAt = '2026-11-20T10:00:00.000Z',
}: {
  role?: ExtendedUIMessage['role'];
  senderWorkspaceMemberId?: string;
  createdAt?: string;
}): Pick<ExtendedUIMessage, 'role' | 'metadata'> => ({
  role,
  metadata: { senderWorkspaceMemberId, createdAt },
});

describe('areAiChatMessagesGrouped', () => {
  it.each([
    {
      description: 'groups messages a member sends in a row',
      message: buildMessage({ createdAt: '2026-11-20T10:04:00.000Z' }),
      expected: true,
    },
    {
      description: 'splits messages from different members',
      message: buildMessage({ senderWorkspaceMemberId: 'other-member' }),
      expected: false,
    },
    {
      description: 'keeps grouping messages sent hours apart',
      message: buildMessage({ createdAt: '2026-11-20T13:00:00.000Z' }),
      expected: true,
    },
    {
      description: 'never groups assistant replies',
      message: buildMessage({ role: 'assistant' }),
      expected: false,
    },
  ])('$description', ({ message, expected }) => {
    expect(
      areAiChatMessagesGrouped({ previousMessage: buildMessage({}), message }),
    ).toBe(expected);
  });
});
