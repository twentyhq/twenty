import { MessageParticipantRole } from 'twenty-shared/types';

import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getChatThreadCounterparts } from '@/activities/emails/utils/getChatThreadCounterparts';

const participant = (
  handle: string,
  displayName: string,
  role = MessageParticipantRole.FROM,
) => ({ handle, displayName, role });

const buildMessage = ({
  id,
  sender,
  recipients = [],
}: {
  id: string;
  sender?: ReturnType<typeof participant>;
  recipients?: ReturnType<typeof participant>[];
}) =>
  ({
    id,
    sender,
    messageParticipants: [...(sender ? [sender] : []), ...recipients],
  }) as EmailThreadMessageWithSender;

const SUNDAR = participant('sundar', 'Sundar Pichai');
const THOMAS = participant('thomas', 'Thomas Kurian');
const PHIL = participant('phil', 'Phil Schiller');

const names = (participants: { displayName: string }[]) =>
  participants.map(({ displayName }) => displayName);

describe('getChatThreadCounterparts', () => {
  it('should return the senders of incoming messages only', () => {
    expect(
      names(
        getChatThreadCounterparts({
          messages: [
            buildMessage({ id: '1', sender: SUNDAR }),
            buildMessage({ id: '2', sender: PHIL }),
            buildMessage({ id: '3', sender: SUNDAR }),
          ],
          outgoingMessageIds: new Set(['2']),
        }),
      ),
    ).toEqual(['Sundar Pichai']);
  });

  it('should list each sender of a group chat once, in order', () => {
    expect(
      names(
        getChatThreadCounterparts({
          messages: [
            buildMessage({ id: '1', sender: THOMAS }),
            buildMessage({ id: '2', sender: SUNDAR }),
            buildMessage({ id: '3', sender: THOMAS }),
          ],
          outgoingMessageIds: new Set(),
        }),
      ),
    ).toEqual(['Thomas Kurian', 'Sundar Pichai']);
  });

  it('should fall back to the recipients when the contact never replied', () => {
    expect(
      names(
        getChatThreadCounterparts({
          messages: [
            buildMessage({
              id: '1',
              sender: PHIL,
              recipients: [
                participant(
                  'sundar',
                  'Sundar Pichai',
                  MessageParticipantRole.TO,
                ),
              ],
            }),
          ],
          outgoingMessageIds: new Set(['1']),
        }),
      ),
    ).toEqual(['Sundar Pichai']);
  });
});
