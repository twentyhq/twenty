import { isNonEmptyString } from '@sniptt/guards';

import { type GoogleMeetParticipant } from 'src/logic-functions/types/google-meet-participant.type';

export const getGoogleMeetParticipantDisplayName = ({
  signedinUser,
  anonymousUser,
  phoneUser,
}: Pick<
  GoogleMeetParticipant,
  'signedinUser' | 'anonymousUser' | 'phoneUser'
>): string | null => {
  const displayName = (
    signedinUser?.displayName ??
    anonymousUser?.displayName ??
    phoneUser?.displayName
  )?.trim();

  return isNonEmptyString(displayName) ? displayName : null;
};
