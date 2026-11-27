import { type IngestMessageParticipant } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { INGEST_MESSAGE_MAX_PARTICIPANT_COUNT } from 'src/constants/ingest-message-max-participant-count.constant';

// Twenty rejects more participants; people in Twenty stay, as only they place the thread on a record
export const limitWhatsappMessageParticipants = ({
  participants,
  channelHandle,
}: {
  participants: IngestMessageParticipant[];
  channelHandle: string;
}): IngestMessageParticipant[] => {
  if (participants.length <= INGEST_MESSAGE_MAX_PARTICIPANT_COUNT) {
    return participants;
  }

  const isAlwaysKept = ({ role, handle }: IngestMessageParticipant) =>
    role === 'FROM' || handle === channelHandle;
  const members = participants.filter(
    (participant) => !isAlwaysKept(participant),
  );

  return [
    ...participants.filter(isAlwaysKept),
    ...members.filter(({ personId }) => isDefined(personId)),
    ...members.filter(({ personId }) => !isDefined(personId)),
  ].slice(0, INGEST_MESSAGE_MAX_PARTICIPANT_COUNT);
};
