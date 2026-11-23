import {
  GOOGLE_MEET_TRANSCRIPT_GENERATED_EVENT_TYPE,
  GOOGLE_WORKSPACE_EVENTS_API_BASE_URL,
} from 'src/logic-functions/constants/google-workspace-events.constant';
import { type GoogleMeetCollectionPage } from 'src/logic-functions/types/google-meet-collection-page.type';
import { type GoogleMeetEventSubscription } from 'src/logic-functions/types/google-meet-event-subscription.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { buildGoogleMeetUserTargetResource } from 'src/logic-functions/utils/build-google-meet-user-target-resource.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

export const findGoogleMeetEventSubscription = async ({
  accessToken,
  googleUserId,
}: {
  accessToken: string;
  googleUserId: string;
}): Promise<GoogleMeetEventSubscription | undefined> => {
  const { subscriptions } = await fetchGoogleMeetJson<
    GoogleMeetCollectionPage<'subscriptions', GoogleMeetEventSubscription>
  >({
    accessToken,
    url: buildGoogleApiUrlOrThrow({
      baseUrl: GOOGLE_WORKSPACE_EVENTS_API_BASE_URL,
      path: 'subscriptions',
      queryParameters: {
        filter: `event_types:"${GOOGLE_MEET_TRANSCRIPT_GENERATED_EVENT_TYPE}" AND target_resource="${buildGoogleMeetUserTargetResource(googleUserId)}"`,
      },
    }),
  });

  return subscriptions?.[0];
};
