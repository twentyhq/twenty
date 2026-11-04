import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

type ChatThreadParticipant = Pick<
  EmailThreadMessageParticipant,
  'handle' | 'role'
>;

type ChatThreadMessage<TParticipant extends ChatThreadParticipant> = {
  id: string;
  sender?: TParticipant;
  messageParticipants?: TParticipant[];
};

const uniqueByHandle = <TParticipant extends ChatThreadParticipant>(
  participants: TParticipant[],
) => [
  ...new Map(
    participants.map((participant) => [participant.handle, participant]),
  ).values(),
];

export const getChatThreadCounterparts = <
  TParticipant extends ChatThreadParticipant,
>({
  messages,
  outgoingMessageIds,
}: {
  messages: ChatThreadMessage<TParticipant>[];
  outgoingMessageIds: ReadonlySet<string>;
}): TParticipant[] => {
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
