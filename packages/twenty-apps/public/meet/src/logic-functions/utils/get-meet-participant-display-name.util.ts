import { isNonEmptyString } from '@sniptt/guards';

import { type MeetParticipant } from 'src/logic-functions/types/meet-participant.type';

export const getMeetParticipantDisplayName = ({
  signedinUser,
  anonymousUser,
  phoneUser,
}: Pick<
  MeetParticipant,
  'signedinUser' | 'anonymousUser' | 'phoneUser'
>): string | null => {
  const displayName = (
    signedinUser?.displayName ??
    anonymousUser?.displayName ??
    phoneUser?.displayName
  )?.trim();

  return isNonEmptyString(displayName) ? displayName : null;
};
