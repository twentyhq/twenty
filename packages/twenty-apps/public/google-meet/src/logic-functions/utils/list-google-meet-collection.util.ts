import { isNonEmptyString } from '@sniptt/guards';

import {
  GOOGLE_MEET_LIST_PAGE_SIZE,
  MAX_GOOGLE_MEET_LIST_PAGES,
} from 'src/logic-functions/constants/google-meet-api.constant';
import { type GoogleMeetCollectionPage } from 'src/logic-functions/types/google-meet-collection-page.type';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { buildGoogleMeetUrlOrThrow } from 'src/logic-functions/utils/build-google-meet-url-or-throw.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

type GoogleMeetCollectionRequest<TCollectionKey extends string> = {
  accessToken: string;
  path: string;
  collectionKey: TCollectionKey;
  filter?: string;
};

const listGoogleMeetCollectionPagesOrThrow = async <
  TCollectionKey extends string,
  TItem,
>({
  accessToken,
  path,
  collectionKey,
  filter,
  pageToken,
  pageIndex,
}: GoogleMeetCollectionRequest<TCollectionKey> & {
  pageToken: string | undefined;
  pageIndex: number;
}): Promise<TItem[]> => {
  if (pageIndex >= MAX_GOOGLE_MEET_LIST_PAGES) {
    throw new GoogleMeetException({
      message: `Google Meet ${collectionKey} pagination exceeded its limit`,
      code: 'PAGINATION_LIMIT_EXCEEDED',
    });
  }

  const page = await fetchGoogleMeetJson<
    GoogleMeetCollectionPage<TCollectionKey, TItem>
  >({
    accessToken,
    url: buildGoogleMeetUrlOrThrow({
      path,
      queryParameters: {
        filter,
        pageSize: String(GOOGLE_MEET_LIST_PAGE_SIZE),
        pageToken,
      },
    }),
  });
  const items: TItem[] = page[collectionKey] ?? [];

  if (!isNonEmptyString(page.nextPageToken)) {
    return items;
  }

  return [
    ...items,
    ...(await listGoogleMeetCollectionPagesOrThrow<TCollectionKey, TItem>({
      accessToken,
      path,
      collectionKey,
      filter,
      pageToken: page.nextPageToken,
      pageIndex: pageIndex + 1,
    })),
  ];
};

export const listGoogleMeetCollection = <TCollectionKey extends string, TItem>(
  request: GoogleMeetCollectionRequest<TCollectionKey>,
): Promise<TItem[]> =>
  listGoogleMeetCollectionPagesOrThrow<TCollectionKey, TItem>({
    ...request,
    pageToken: undefined,
    pageIndex: 0,
  });
