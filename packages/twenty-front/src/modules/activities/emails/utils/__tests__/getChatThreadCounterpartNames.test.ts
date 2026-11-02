import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getChatThreadCounterpartNames } from '@/activities/emails/utils/getChatThreadCounterpartNames';

const buildMessage = (id: string, displayName?: string) =>
  ({
    id,
    text: id,
    sender: displayName === undefined ? undefined : { displayName },
  }) as EmailThreadMessageWithSender;

describe('getChatThreadCounterpartNames', () => {
  it('should return the sender of incoming messages only', () => {
    expect(
      getChatThreadCounterpartNames(
        [
          buildMessage('1', 'Sundar Pichai'),
          buildMessage('2', 'Phil Schiller'),
          buildMessage('3', 'Sundar Pichai'),
        ],
        new Set(['2']),
      ),
    ).toEqual(['Sundar Pichai']);
  });

  it('should list each sender of a group chat once, in order', () => {
    expect(
      getChatThreadCounterpartNames(
        [
          buildMessage('1', 'Thomas Kurian'),
          buildMessage('2', 'Sundar Pichai'),
          buildMessage('3', 'Thomas Kurian'),
        ],
        new Set(),
      ),
    ).toEqual(['Thomas Kurian', 'Sundar Pichai']);
  });

  it('should skip messages without a sender name', () => {
    expect(
      getChatThreadCounterpartNames(
        [buildMessage('1'), buildMessage('2', '')],
        new Set(),
      ),
    ).toEqual([]);
  });
});
