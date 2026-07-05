import { isDefined } from 'src/utils/is-defined';

import { FIREFLIES_BACKFILL_ROUTE_PATH } from 'src/constants/fireflies-backfill-route-path';
import { postToOwnRoute } from 'src/logic-functions/utils/post-to-own-route';

export const requestFirefliesBackfill = async ({
  fromDate,
  cursor,
}: {
  fromDate?: string;
  cursor?: string;
} = {}): Promise<boolean> =>
  postToOwnRoute({
    path: FIREFLIES_BACKFILL_ROUTE_PATH,
    body: {
      ...(isDefined(fromDate) ? { fromDate } : {}),
      ...(isDefined(cursor) ? { cursor } : {}),
    },
  });
