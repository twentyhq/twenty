import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import { FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { hydrateFathomMeeting } from 'src/logic-functions/utils/hydrate-fathom-meeting.util';
import { syncFathomMeetingToCallRecording } from 'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util';

export const fathomBackfillBatchHandler = async (payload: {
  connectedAccountId: string;
  meetings: SerializedFathomMeeting[];
}) => {
  const connection = await getConnection(payload.connectedAccountId);
  const fathomClient = createFathomClient(connection.accessToken);
  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const results = [];

  // Sequential on purpose: the batch is the unit of pacing against Fathom.
  for (const serializedMeeting of payload.meetings) {
    const meeting = await hydrateFathomMeeting({
      fathomClient,
      serializedMeeting,
    });

    results.push(
      await syncFathomMeetingToCallRecording({ coreApiClient, meeting }),
    );
  }

  return { success: true, importedMeetingCount: results.length, results };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  name: 'fathom-backfill-batch',
  description:
    'Fetches the transcript and summary of one paced batch of Fathom meetings and upserts their CallRecordings.',
  timeoutSeconds: 120,
  handler: fathomBackfillBatchHandler,
});
