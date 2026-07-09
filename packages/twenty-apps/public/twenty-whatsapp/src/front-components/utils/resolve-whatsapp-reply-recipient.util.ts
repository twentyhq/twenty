import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type WhatsappParticipant = {
  handle: string;
  role: string;
};

type WhatsappPersonPhones = {
  primaryPhoneCallingCode: string;
  primaryPhoneNumber: string;
};

export const resolveWhatsappReplyRecipient = ({
  whatsappParticipants,
  personPhones,
}: {
  whatsappParticipants: WhatsappParticipant[];
  personPhones: WhatsappPersonPhones | undefined;
}): string | undefined => {
  const fromParticipant = whatsappParticipants.find(
    (participant) =>
      participant.role === 'FROM' && isNonEmptyString(participant.handle),
  );

  if (fromParticipant !== undefined) {
    return fromParticipant.handle;
  }

  const participantWithHandle = whatsappParticipants.find((participant) =>
    isNonEmptyString(participant.handle),
  );

  if (participantWithHandle !== undefined) {
    return participantWithHandle.handle;
  }

  if (
    personPhones !== undefined &&
    isNonEmptyString(personPhones.primaryPhoneNumber)
  ) {
    return `${personPhones.primaryPhoneCallingCode}${personPhones.primaryPhoneNumber}`;
  }

  return undefined;
};
