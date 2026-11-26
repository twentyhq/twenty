import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type MeetEventSubscription } from 'src/logic-functions/types/meet-event-subscription.type';
import { MeetException } from 'src/logic-functions/types/meet-exception.type';
import { type GoogleWorkspaceEventsOperation } from 'src/logic-functions/types/google-workspace-events-operation.type';

export const readMeetEventSubscriptionOrThrow = ({
  response,
  error,
}: Pick<
  GoogleWorkspaceEventsOperation,
  'response' | 'error'
>): MeetEventSubscription => {
  if (isDefined(error) || !isNonEmptyString(response?.name)) {
    throw new MeetException({
      message: `Google did not return the event subscription: ${error?.message ?? 'the operation has no result'}`,
      code: 'EVENT_SUBSCRIPTION_FAILED',
      googleStatus: error?.status,
    });
  }

  return response;
};
