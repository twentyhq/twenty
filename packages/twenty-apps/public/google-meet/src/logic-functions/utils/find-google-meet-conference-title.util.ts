import { isNonEmptyString } from '@sniptt/guards';

import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { type GoogleMeetTranscript } from 'src/logic-functions/types/google-meet-transcript.type';
import { extractGoogleMeetNameFromDocTitle } from 'src/logic-functions/utils/extract-google-meet-name-from-doc-title.util';
import { getGoogleDocTitle } from 'src/logic-functions/utils/get-google-doc-title.util';

export const findGoogleMeetConferenceTitle = async ({
  accessToken,
  calendarEvent,
  transcripts,
}: {
  accessToken: string;
  calendarEvent: Pick<CalendarEventCandidate, 'title'> | undefined;
  transcripts: Pick<GoogleMeetTranscript, 'docsDestination'>[];
}): Promise<string | undefined> => {
  const calendarEventTitle = calendarEvent?.title?.trim();

  if (isNonEmptyString(calendarEventTitle)) {
    return calendarEventTitle;
  }

  const documentId = transcripts
    .map(({ docsDestination }) => docsDestination?.document)
    .find(isNonEmptyString);

  if (!isNonEmptyString(documentId)) {
    return undefined;
  }

  return extractGoogleMeetNameFromDocTitle(
    await getGoogleDocTitle({ accessToken, documentId }),
  );
};
