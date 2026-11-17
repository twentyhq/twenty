import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { MILLISECONDS_PER_DAY } from 'src/logic-functions/constants/google-meet-import.constant';
import { type GoogleMeetDailyJobName } from 'src/logic-functions/types/google-meet-daily-job-name.type';

export const buildGoogleMeetDailyJob = ({
  jobName,
  connectedAccountId,
  now,
}: {
  jobName: GoogleMeetDailyJobName;
  connectedAccountId: string;
  now: Date;
}): EnqueueJobItem => ({
  jobId: `google-meet-${jobName}-${connectedAccountId}-${Math.floor(now.getTime() / MILLISECONDS_PER_DAY)}`,
  payload: { connectedAccountId },
});
