import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { MILLISECONDS_PER_HOUR } from 'src/logic-functions/constants/google-meet-import.constant';
import { type GoogleMeetDiscoveryTrigger } from 'src/logic-functions/types/google-meet-discovery-trigger.type';

export const buildGoogleMeetDiscoveryJob = ({
  connectedAccountId,
  trigger,
  now,
}: {
  connectedAccountId: string;
  trigger: GoogleMeetDiscoveryTrigger;
  now: Date;
}): EnqueueJobItem => ({
  jobId: `google-meet-discovery-${trigger}-${connectedAccountId}-${Math.floor(now.getTime() / MILLISECONDS_PER_HOUR)}`,
  payload: { connectedAccountId },
});
