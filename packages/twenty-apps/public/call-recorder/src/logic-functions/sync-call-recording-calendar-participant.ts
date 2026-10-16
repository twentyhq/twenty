import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { type ConnectionPage } from 'src/logic-functions/data/fetch-all-nodes.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { getCurrentApplicationId } from 'src/logic-functions/utils/get-current-application-id.util';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { syncCallRecordingCalendarParticipant } from 'src/logic-functions/utils/sync-call-recording-calendar-participant.util';

export const syncCallRecordingCalendarParticipantHandler = async (
  payload: unknown,
): Promise<void> => {
  const body = asRecord(payload);
  const recordId = getString(body?.recordId);
  const after = getString(body?.after);
  const client = new CoreApiClient();
  const applicationId = getCurrentApplicationId();

  try {
    if (isNonEmptyString(recordId)) {
      await syncCallRecordingCalendarParticipant({
        client,
        applicationId,
        callRecordingId: recordId,
      });
      return;
    }

    const result = await client.query({
      callRecordings: {
        __args: {
          filter: {
            applicationId: { eq: applicationId },
            calendarEventId: { is: 'NOT_NULL' },
          },
          first: TWENTY_PAGE_SIZE,
          orderBy: [{ id: 'AscNullsLast' }],
          ...(isNonEmptyString(after) ? { after } : {}),
        },
        pageInfo: { hasNextPage: true, endCursor: true },
        edges: { node: { id: true } },
      },
    });
    const page = result.callRecordings as
      | ConnectionPage<{ id: string }>
      | undefined;
    if (!page) {
      throw new Error('Calendar participant backfill returned no connection');
    }
    const nextCursor = page.pageInfo?.endCursor;
    if (
      page.pageInfo?.hasNextPage &&
      (!isNonEmptyString(nextCursor) || nextCursor === after)
    ) {
      throw new Error(
        'Calendar participant backfill returned an invalid cursor',
      );
    }
    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier:
        SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        ...(page.edges ?? []).map(({ node }) => ({ recordId: node.id })),
        ...(page.pageInfo?.hasNextPage ? [{ after: nextCursor }] : []),
      ],
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      'calendar participant synchronization',
      error,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier:
    SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-call-recording-calendar-participant',
  description:
    'Maintains the Call Recorder calendar participant from the current recording state.',
  timeoutSeconds: 30,
  handler: syncCallRecordingCalendarParticipantHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.*',
    updatedFields: [
      'calendarEventId',
      'externalBotId',
      'status',
      'applicationId',
    ],
  },
});
