import {
  MEET_TRANSCRIPT_GENERATED_EVENT_TYPE,
  GOOGLE_WORKSPACE_EVENTS_API_BASE_URL,
} from 'src/logic-functions/constants/google-workspace-events.constant';
import { type MeetCollectionPage } from 'src/logic-functions/types/meet-collection-page.type';
import { type MeetEventSubscription } from 'src/logic-functions/types/meet-event-subscription.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { buildMeetUserTargetResource } from 'src/logic-functions/utils/build-meet-user-target-resource.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';

export const findMeetEventSubscription = async ({
  accessToken,
  googleUserId,
}: {
  accessToken: string;
  googleUserId: string;
}): Promise<MeetEventSubscription | undefined> => {
  const { subscriptions } = await fetchMeetJson<
    MeetCollectionPage<'subscriptions', MeetEventSubscription>
  >({
    accessToken,
    url: buildGoogleApiUrlOrThrow({
      baseUrl: GOOGLE_WORKSPACE_EVENTS_API_BASE_URL,
      path: 'subscriptions',
      queryParameters: {
        filter: `event_types:"${MEET_TRANSCRIPT_GENERATED_EVENT_TYPE}" AND target_resource="${buildMeetUserTargetResource(googleUserId)}"`,
      },
    }),
  });

  return subscriptions?.[0];
};
