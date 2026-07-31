import { MILLISECONDS_PER_DAY } from 'src/logic-functions/constants/milliseconds-per-day.constant';
import { type FirefliesBackfillCursor } from 'src/logic-functions/types/fireflies-backfill-cursor.type';

export const buildFirefliesBackfillCursor = ({
  windowDays,
  nowMilliseconds,
}: {
  windowDays: number;
  nowMilliseconds: number;
}): FirefliesBackfillCursor => ({
  fromDate: new Date(
    nowMilliseconds - windowDays * MILLISECONDS_PER_DAY,
  ).toISOString(),
  toDate: new Date(nowMilliseconds).toISOString(),
  skip: 0,
});
