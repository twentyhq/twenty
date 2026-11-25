import { isNonEmptyString } from '@sniptt/guards';

import {
  MEET_LIST_PAGE_SIZE,
  MAX_MEET_LIST_PAGES,
} from 'src/logic-functions/constants/meet-api.constant';
import { type MeetCollectionPage } from 'src/logic-functions/types/meet-collection-page.type';
import { MeetException } from 'src/logic-functions/types/meet-exception.type';
import { buildMeetUrlOrThrow } from 'src/logic-functions/utils/build-meet-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';

type MeetCollectionRequest<TCollectionKey extends string> = {
  accessToken: string;
  path: string;
  collectionKey: TCollectionKey;
  filter?: string;
};

const listMeetCollectionPagesOrThrow = async <
  TCollectionKey extends string,
  TItem,
>({
  accessToken,
  path,
  collectionKey,
  filter,
  pageToken,
  pageIndex,
}: MeetCollectionRequest<TCollectionKey> & {
  pageToken: string | undefined;
  pageIndex: number;
}): Promise<TItem[]> => {
  if (pageIndex >= MAX_MEET_LIST_PAGES) {
    throw new MeetException({
      message: `Google Meet ${collectionKey} pagination exceeded its limit`,
      code: 'PAGINATION_LIMIT_EXCEEDED',
    });
  }

  const page = await fetchMeetJson<
    MeetCollectionPage<TCollectionKey, TItem>
  >({
    accessToken,
    url: buildMeetUrlOrThrow({
      path,
      queryParameters: {
        filter,
        pageSize: String(MEET_LIST_PAGE_SIZE),
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
    ...(await listMeetCollectionPagesOrThrow<TCollectionKey, TItem>({
      accessToken,
      path,
      collectionKey,
      filter,
      pageToken: page.nextPageToken,
      pageIndex: pageIndex + 1,
    })),
  ];
};

export const listMeetCollection = <TCollectionKey extends string, TItem>(
  request: MeetCollectionRequest<TCollectionKey>,
): Promise<TItem[]> =>
  listMeetCollectionPagesOrThrow<TCollectionKey, TItem>({
    ...request,
    pageToken: undefined,
    pageIndex: 0,
  });
