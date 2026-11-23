import { isNonEmptyString } from '@sniptt/guards';

import {
  GOOGLE_WORKSPACE_EVENTS_API_BASE_URL,
  GOOGLE_WORKSPACE_EVENTS_OPERATION_MAX_POLLS,
  GOOGLE_WORKSPACE_EVENTS_OPERATION_POLL_DELAY_MILLISECONDS,
} from 'src/logic-functions/constants/google-workspace-events.constant';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { type GoogleWorkspaceEventsOperation } from 'src/logic-functions/types/google-workspace-events-operation.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';
import { sleepForMilliseconds } from 'src/logic-functions/utils/sleep-for-milliseconds.util';

export const waitForGoogleWorkspaceEventsOperationOrThrow = async ({
  accessToken,
  operation,
  pollCount,
}: {
  accessToken: string;
  operation: GoogleWorkspaceEventsOperation;
  pollCount: number;
}): Promise<GoogleWorkspaceEventsOperation> => {
  if (operation.done) {
    return operation;
  }

  if (
    !isNonEmptyString(operation.name) ||
    pollCount >= GOOGLE_WORKSPACE_EVENTS_OPERATION_MAX_POLLS
  ) {
    throw new GoogleMeetException({
      message: `Google did not finish the event subscription operation ${operation.name ?? 'without a name'}`,
      code: 'EVENT_SUBSCRIPTION_FAILED',
    });
  }

  await sleepForMilliseconds(
    GOOGLE_WORKSPACE_EVENTS_OPERATION_POLL_DELAY_MILLISECONDS,
  );

  return waitForGoogleWorkspaceEventsOperationOrThrow({
    accessToken,
    operation: await fetchGoogleMeetJson<GoogleWorkspaceEventsOperation>({
      accessToken,
      url: buildGoogleApiUrlOrThrow({
        baseUrl: GOOGLE_WORKSPACE_EVENTS_API_BASE_URL,
        path: operation.name,
        queryParameters: {},
      }),
    }),
    pollCount: pollCount + 1,
  });
};
