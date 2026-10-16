import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import { SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getCurrentApplicationId } from 'src/logic-functions/utils/get-current-application-id.util';
import { syncCallRecordingCalendarParticipant } from 'src/logic-functions/utils/sync-call-recording-calendar-participant.util';

const snapshotSchema = z
  .object({ applicationId: z.string().nullish() })
  .nullish();
const eventSchema = z.object({
  recordId: z.string().min(1),
  properties: z
    .object({ before: snapshotSchema, after: snapshotSchema })
    .optional(),
});

export const syncCallRecordingCalendarParticipantHandler = async (
  payload: unknown,
): Promise<void> => {
  const { recordId, properties } = eventSchema.parse(payload);
  const applicationId = getCurrentApplicationId();
  if (
    isDefined(properties) &&
    properties.before?.applicationId !== applicationId &&
    properties.after?.applicationId !== applicationId
  ) {
    return;
  }

  try {
    await syncCallRecordingCalendarParticipant({
      client: new CoreApiClient({ runAs: 'application' }),
      applicationId,
      callRecordingId: recordId,
    });
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
    'Maintains the Fireflies participant for imported recordings linked to calendar events.',
  timeoutSeconds: 30,
  handler: syncCallRecordingCalendarParticipantHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.*',
    updatedFields: ['calendarEventId', 'status', 'applicationId'],
  },
});
