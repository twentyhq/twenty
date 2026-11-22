import { isAiChatMessageTimeSharedWithNext } from '@/ai-chat/messages/utils/isAiChatMessageTimeSharedWithNext';

const buildMessage = (createdAt?: string) => ({ metadata: { createdAt } });

describe('isAiChatMessageTimeSharedWithNext', () => {
  it.each([
    {
      description: 'shares the time with a message sent seconds later',
      nextCreatedAt: '2026-11-20T10:00:59.000Z',
      expected: true,
    },
    {
      description: 'keeps its own time once a minute has passed',
      nextCreatedAt: '2026-11-20T10:01:00.000Z',
      expected: false,
    },
    {
      description: 'keeps its own time when the next time is unknown',
      nextCreatedAt: undefined,
      expected: false,
    },
  ])('$description', ({ nextCreatedAt, expected }) => {
    expect(
      isAiChatMessageTimeSharedWithNext({
        message: buildMessage('2026-11-20T10:00:00.000Z'),
        nextMessage: buildMessage(nextCreatedAt),
      }),
    ).toBe(expected);
  });
});
