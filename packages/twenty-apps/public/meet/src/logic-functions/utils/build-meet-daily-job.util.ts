import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { MILLISECONDS_PER_DAY } from 'src/logic-functions/constants/meet-import.constant';
import { type MeetDailyJobName } from 'src/logic-functions/types/meet-daily-job-name.type';

export const buildMeetDailyJob = ({
  jobName,
  connectedAccountId,
  now,
}: {
  jobName: MeetDailyJobName;
  connectedAccountId: string;
  now: Date;
}): EnqueueJobItem => ({
  jobId: `google-meet-${jobName}-${connectedAccountId}-${Math.floor(now.getTime() / MILLISECONDS_PER_DAY)}`,
  payload: { connectedAccountId },
});
