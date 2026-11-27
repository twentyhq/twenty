import { isNonEmptyString } from '@sniptt/guards';

import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { type MeetSmartNote } from 'src/logic-functions/types/meet-smart-note.type';
import { type MeetTranscript } from 'src/logic-functions/types/meet-transcript.type';
import { extractMeetNameFromDocTitle } from 'src/logic-functions/utils/extract-meet-name-from-doc-title.util';
import { getGoogleDocTitle } from 'src/logic-functions/utils/get-google-doc-title.util';

export const findMeetConferenceTitle = async ({
  accessToken,
  calendarEvent,
  artifacts,
}: {
  accessToken: string;
  calendarEvent: Pick<CalendarEventCandidate, 'title'> | undefined;
  artifacts: Pick<
    MeetTranscript | MeetSmartNote,
    'docsDestination'
  >[];
}): Promise<string | undefined> => {
  const calendarEventTitle = calendarEvent?.title?.trim();

  if (isNonEmptyString(calendarEventTitle)) {
    return calendarEventTitle;
  }

  const documentId = artifacts
    .map(({ docsDestination }) => docsDestination?.document)
    .find(isNonEmptyString);

  if (!isNonEmptyString(documentId)) {
    return undefined;
  }

  return extractMeetNameFromDocTitle(
    await getGoogleDocTitle({ accessToken, documentId }),
  );
};
