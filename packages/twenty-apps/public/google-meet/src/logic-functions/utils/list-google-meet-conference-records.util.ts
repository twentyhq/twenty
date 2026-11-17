import { isNonEmptyString } from '@sniptt/guards';

import {
  GOOGLE_MEET_CONFERENCE_RECORD_PAGE_SIZE,
  MAX_GOOGLE_MEET_CONFERENCE_RECORD_PAGES,
} from 'src/logic-functions/constants/google-meet-api.constant';
import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { type GoogleMeetConferenceRecordPage } from 'src/logic-functions/types/google-meet-conference-record-page.type';
import { buildGoogleMeetConferenceRecordFilter } from 'src/logic-functions/utils/build-google-meet-conference-record-filter.util';
import { buildGoogleMeetUrl } from 'src/logic-functions/utils/build-google-meet-url.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

const listGoogleMeetConferenceRecordPages = async ({
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
    throw new Error('Google Meet conference pagination exceeded its limit');
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
    ...(await listGoogleMeetConferenceRecordPages({
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
  listGoogleMeetConferenceRecordPages({
    accessToken,
    filter: buildGoogleMeetConferenceRecordFilter({
      startedAfter,
      startedBefore,
    }),
    pageToken: undefined,
    pageIndex: 0,
  });
