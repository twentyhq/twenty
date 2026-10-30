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
    );

    expect(groups).toHaveLength(2);
  });
});
