import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

const uniqueByHandle = (participants: EmailThreadMessageParticipant[]) => [
  ...new Map(
    participants.map((participant) => [participant.handle, participant]),
  ).values(),
];

export const getChatThreadCounterparts = ({
  messages,
  outgoingMessageIds,
}: {
  messages: EmailThreadMessageWithSender[];
  outgoingMessageIds: ReadonlySet<string>;
}): EmailThreadMessageParticipant[] => {
  const incomingSenders = uniqueByHandle(
    messages
      .filter(({ id }) => !outgoingMessageIds.has(id))
      .map(({ sender }) => sender)
      .filter(isDefined),
  );

  if (incomingSenders.length > 0) {
    return incomingSenders;
  }

  return uniqueByHandle(
    messages
      .filter(({ id }) => outgoingMessageIds.has(id))
      .flatMap(({ messageParticipants }) => messageParticipants ?? [])
      .filter(({ role }) => role === MessageParticipantRole.TO),
  );
};
