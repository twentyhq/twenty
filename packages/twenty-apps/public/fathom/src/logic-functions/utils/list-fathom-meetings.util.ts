import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';

import { MAX_FATHOM_MEETING_PAGES } from 'src/constants/fathom.constant';
import { type FathomMeetingLister } from 'src/logic-functions/types/fathom-meeting-lister.type';
import { listFathomMeetingPage } from 'src/logic-functions/utils/list-fathom-meeting-page.util';

// Fathom has no endpoint for one meeting, so on-demand lookups walk the list
// until the caller has what it needs; the page cap keeps a miss inside the
// logic function timeout.
export const listFathomMeetings = async ({
  fathomClient,
  createdAfter,
  stopWhen,
}: {
  fathomClient: FathomMeetingLister;
  createdAfter?: string;
  stopWhen?: (meetings: Meeting[]) => boolean;
}): Promise<Meeting[]> => {
  const meetings: Meeting[] = [];
  let cursor: string | undefined = undefined;

  for (let page = 0; page < MAX_FATHOM_MEETING_PAGES; page++) {
    const meetingPage = await listFathomMeetingPage({
      fathomClient,
      createdAfter,
      cursor,
    });

    meetings.push(...meetingPage.meetings);

    if (stopWhen?.(meetings) || !isNonEmptyString(meetingPage.nextCursor)) {
      return meetings;
    }

    cursor = meetingPage.nextCursor;
  }

  throw new Error(
    `Fathom meeting listing exceeded ${MAX_FATHOM_MEETING_PAGES} pages`,
  );
};
