import { isNonEmptyString } from '@sniptt/guards';

import {
  GOOGLE_MEET_CONFERENCE_RECORD_PAGE_SIZE,
  MAX_GOOGLE_MEET_CONFERENCE_RECORD_PAGES,
} from 'src/logic-functions/constants/google-meet-api.constant';
import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { type GoogleMeetConferenceRecordPage } from 'src/logic-functions/types/google-meet-conference-record-page.type';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { buildGoogleMeetConferenceRecordFilter } from 'src/logic-functions/utils/build-google-meet-conference-record-filter.util';
import { buildGoogleMeetUrl } from 'src/logic-functions/utils/build-google-meet-url.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

const listGoogleMeetConferenceRecordPagesOrThrow = async ({
  accessToken,
  filter,
  pageToken,
  pageIndex,
}: {
  accessToken: string;
  filter: string;
  pageToken: string | undefined;
  pageIndex: number;
}): Promise<GoogleMeetConferenceRecord[]> => {
  if (pageIndex >= MAX_GOOGLE_MEET_CONFERENCE_RECORD_PAGES) {
    throw new GoogleMeetException({
      message: 'Google Meet conference pagination exceeded its limit',
      code: 'PAGINATION_LIMIT_EXCEEDED',
    });
  }

  const page = await fetchGoogleMeetJson<GoogleMeetConferenceRecordPage>({
    accessToken,
    url: buildGoogleMeetUrl({
      path: 'conferenceRecords',
      queryParameters: {
        filter,
        pageSize: String(GOOGLE_MEET_CONFERENCE_RECORD_PAGE_SIZE),
        pageToken,
      },
    }),
  });
  const conferenceRecords = page.conferenceRecords ?? [];

  if (!isNonEmptyString(page.nextPageToken)) {
    return conferenceRecords;
  }

  return [
    ...conferenceRecords,
    ...(await listGoogleMeetConferenceRecordPagesOrThrow({
      accessToken,
      filter,
      pageToken: page.nextPageToken,
      pageIndex: pageIndex + 1,
    })),
  ];
};

export const listGoogleMeetConferenceRecords = ({
  accessToken,
  startedAfter,
  startedBefore,
}: {
  accessToken: string;
  startedAfter: Date;
  startedBefore: Date;
}): Promise<GoogleMeetConferenceRecord[]> =>
  listGoogleMeetConferenceRecordPagesOrThrow({
    accessToken,
    filter: buildGoogleMeetConferenceRecordFilter({
      startedAfter,
      startedBefore,
    }),
    pageToken: undefined,
    pageIndex: 0,
  });
