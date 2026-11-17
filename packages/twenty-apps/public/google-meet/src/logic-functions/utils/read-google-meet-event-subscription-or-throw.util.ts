import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GoogleMeetEventSubscription } from 'src/logic-functions/types/google-meet-event-subscription.type';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { type GoogleWorkspaceEventsOperation } from 'src/logic-functions/types/google-workspace-events-operation.type';

export const readGoogleMeetEventSubscriptionOrThrow = ({
  response,
  error,
}: Pick<
  GoogleWorkspaceEventsOperation,
  'response' | 'error'
>): GoogleMeetEventSubscription => {
  if (isDefined(error) || !isNonEmptyString(response?.name)) {
    throw new GoogleMeetException({
      message: `Google did not return the event subscription: ${error?.message ?? 'the operation has no result'}`,
      code: 'EVENT_SUBSCRIPTION_FAILED',
      googleStatus: error?.status,
    });
  }

  return response;
};
