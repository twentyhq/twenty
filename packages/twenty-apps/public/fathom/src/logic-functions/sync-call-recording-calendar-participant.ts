import { isNonEmptyString, isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';

import { SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getCurrentApplicationId } from 'src/logic-functions/utils/get-current-application-id.util';
import { syncCallRecordingCalendarParticipant } from 'src/logic-functions/utils/sync-call-recording-calendar-participant.util';

export const syncCallRecordingCalendarParticipantHandler = async (
  payload: unknown,
): Promise<void> => {
  const { recordId, after } = (isObject(payload) ? payload : {}) as {
    recordId?: unknown;
    after?: unknown;
  };
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
          first: 100,
          orderBy: [{ id: 'AscNullsLast' }],
          ...(isNonEmptyString(after) ? { after } : {}),
        },
        pageInfo: { hasNextPage: true, endCursor: true },
        edges: { node: { id: true } },
      },
    });
    const page = result.callRecordings as
      | {
          edges?: Array<{ node: { id: string } }>;
          pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
        }
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
    const payloads = [
      ...(page.edges ?? []).map(({ node }) => ({ recordId: node.id })),
      ...(page.pageInfo?.hasNextPage ? [{ after: nextCursor }] : []),
    ];
    if (payloads.length > 0) {
      await enqueueFathomJobsOrThrow({
        logicFunctionUniversalIdentifier:
          SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads,
      });
    }
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `Calendar participant synchronization failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier:
    SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-call-recording-calendar-participant',
  description:
    'Maintains the Fathom participant for imported recordings linked to calendar events.',
  timeoutSeconds: 30,
  handler: syncCallRecordingCalendarParticipantHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.*',
    updatedFields: ['calendarEventId', 'status', 'applicationId'],
  },
});
