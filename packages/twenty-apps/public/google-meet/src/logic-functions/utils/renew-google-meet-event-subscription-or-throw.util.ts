import { GOOGLE_WORKSPACE_EVENTS_API_BASE_URL } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type GoogleMeetEventSubscription } from 'src/logic-functions/types/google-meet-event-subscription.type';
import { type GoogleWorkspaceEventsOperation } from 'src/logic-functions/types/google-workspace-events-operation.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';
import { readGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/read-google-meet-event-subscription-or-throw.util';
import { waitForGoogleWorkspaceEventsOperationOrThrow } from 'src/logic-functions/utils/wait-for-google-workspace-events-operation-or-throw.util';

export const renewGoogleMeetEventSubscriptionOrThrow = async ({
  accessToken,
  subscriptionName,
}: {
  accessToken: string;
  subscriptionName: string;
}): Promise<GoogleMeetEventSubscription> =>
  readGoogleMeetEventSubscriptionOrThrow(
    await waitForGoogleWorkspaceEventsOperationOrThrow({
      accessToken,
      pollCount: 0,
      operation: await fetchGoogleMeetJson<GoogleWorkspaceEventsOperation>({
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
