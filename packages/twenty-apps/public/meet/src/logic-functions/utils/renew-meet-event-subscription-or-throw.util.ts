import { GOOGLE_WORKSPACE_EVENTS_API_BASE_URL } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type MeetEventSubscription } from 'src/logic-functions/types/meet-event-subscription.type';
import { type GoogleWorkspaceEventsOperation } from 'src/logic-functions/types/google-workspace-events-operation.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';
import { readMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/read-meet-event-subscription-or-throw.util';
import { waitForGoogleWorkspaceEventsOperationOrThrow } from 'src/logic-functions/utils/wait-for-google-workspace-events-operation-or-throw.util';

export const renewMeetEventSubscriptionOrThrow = async ({
  accessToken,
  subscriptionName,
}: {
  accessToken: string;
  subscriptionName: string;
}): Promise<MeetEventSubscription> =>
  readMeetEventSubscriptionOrThrow(
    await waitForGoogleWorkspaceEventsOperationOrThrow({
      accessToken,
      pollCount: 0,
      operation: await fetchMeetJson<GoogleWorkspaceEventsOperation>({
        accessToken,
        url: buildGoogleApiUrlOrThrow({
          baseUrl: GOOGLE_WORKSPACE_EVENTS_API_BASE_URL,
          path: subscriptionName,
          queryParameters: { updateMask: 'ttl' },
        }),
        method: 'PATCH',
        // Google reads a zero duration as the longest lifetime it allows.
        body: { ttl: '0s' },
      }),
    }),
  );
