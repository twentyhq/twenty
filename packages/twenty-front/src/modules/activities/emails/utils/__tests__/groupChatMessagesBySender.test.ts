import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { groupChatMessagesBySender } from '@/activities/emails/utils/groupChatMessagesBySender';

const buildMessage = (id: string, senderHandle: string) =>
  ({
    id,
    text: id,
    sender: { handle: senderHandle },
  }) as EmailThreadMessageWithSender;

describe('groupChatMessagesBySender', () => {
  it('should group consecutive messages from the same sender', () => {
    const groups = groupChatMessagesBySender(
      [
        buildMessage('1', 'sundar'),
        buildMessage('2', 'sundar'),
        buildMessage('3', 'phil'),
        buildMessage('4', 'phil'),
        buildMessage('5', 'sundar'),
      ],
      new Set(['3', '4']),
      'UTC',
    );

    expect(
      groups.map(({ isOutgoing, messages }) => ({
        isOutgoing,
        messageIds: messages.map(({ id }) => id),
      })),
    ).toEqual([
      { isOutgoing: false, messageIds: ['1', '2'] },
      { isOutgoing: true, messageIds: ['3', '4'] },
      { isOutgoing: false, messageIds: ['5'] },
    ]);
  });

  it('should split messages of different senders in a group chat', () => {
    const groups = groupChatMessagesBySender(
      [buildMessage('1', 'thomas'), buildMessage('2', 'sundar')],
      new Set(),
      'UTC',
    );

    expect(groups).toHaveLength(2);
  });

  it('should not merge messages whose sender is unknown', () => {
    const senderlessMessage = (id: string) =>
      ({ id, text: id, sender: undefined }) as EmailThreadMessageWithSender;

    const groups = groupChatMessagesBySender(
      [senderlessMessage('1'), senderlessMessage('2')],
      new Set(),
      'UTC',
    );

    expect(groups).toHaveLength(2);
  });

  it('should start a new group when the same sender writes on another day', () => {
    const datedMessage = (id: string, receivedAt: string) => ({
      ...buildMessage(id, 'sundar'),
      receivedAt,
    });

    const groups = groupChatMessagesBySender(
      [
        datedMessage('1', '2026-11-22T22:00:00.000Z'),
        datedMessage('2', '2026-11-22T23:30:00.000Z'),
        datedMessage('3', '2026-11-23T08:00:00.000Z'),
      ],
      new Set(),
      'UTC',
    );

    expect(
      groups.map(({ isFirstOfDay, messages }) => ({
        isFirstOfDay,
        messageIds: messages.map(({ id }) => id),
      })),
    ).toEqual([
      { isFirstOfDay: true, messageIds: ['1', '2'] },
      { isFirstOfDay: true, messageIds: ['3'] },
    ]);
  });
});
