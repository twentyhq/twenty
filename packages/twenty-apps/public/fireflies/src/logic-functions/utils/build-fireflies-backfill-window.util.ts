import { MILLISECONDS_PER_DAY } from 'src/logic-functions/constants/milliseconds-per-day.constant';
import { type FirefliesBackfillWindow } from 'src/logic-functions/types/fireflies-backfill-window.type';

export const buildFirefliesBackfillWindow = ({
  windowDays,
  nowMilliseconds,
}: {
  windowDays: number;
  nowMilliseconds: number;
}): FirefliesBackfillWindow => ({
  fromDate: new Date(
    nowMilliseconds - windowDays * MILLISECONDS_PER_DAY,
  ).toISOString(),
  toDate: new Date(nowMilliseconds).toISOString(),
});
