import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';

export const reconcileCallRecordingMeeting = async ({
  client,
  callRecordingId,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
}): Promise<void> => {
  const calendarEventId = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0]?.calendarEventId;

  if (isUndefined(calendarEventId)) {
    return;
  }

  await reconcileCallRecorderForCalendarEventIds({
    client,
    calendarEventIds: [calendarEventId],
  });
};
