import { GOOGLE_WORKSPACE_EVENTS_API_BASE_URL } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type GoogleWorkspaceEventsOperation } from 'src/logic-functions/types/google-workspace-events-operation.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';

export const deleteMeetEventSubscription = async ({
  accessToken,
  subscriptionName,
}: {
  accessToken: string;
  subscriptionName: string;
}): Promise<void> => {
  await fetchMeetJson<GoogleWorkspaceEventsOperation>({
    accessToken,
    url: buildGoogleApiUrlOrThrow({
      baseUrl: GOOGLE_WORKSPACE_EVENTS_API_BASE_URL,
      path: subscriptionName,
      queryParameters: { allowMissing: 'true' },
    }),
    method: 'DELETE',
  });
};
