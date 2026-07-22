import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { SCHEDULE_RECALL_BOT_ON_CALL_RECORDING_UPDATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/schedule-recall-bot-on-call-recording-update-logic-function-universal-identifier';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import {
  resumePendingCallRecording,
  type ResumePendingCallRecordingResult,
} from 'src/logic-functions/flows/resume-pending-call-recording.util';

const CALL_RECORDING_OBJECT_NAME = 'callRecording';

// Only these fields can transition a row into the pending shape; ignoring the
// rest keeps this trigger from re-firing on its own scheduling-progress
// writes (botScheduleAttemptedAt, botScheduleIdempotencyKey, externalBotId
// write-back) and on webhook artifact updates.
const PENDING_TRANSITION_FIELDS = [
  'recordingRequestStatus',
  'status',
  'externalBotId',
  'calendarEventId',
];

type CallRecordingForDatabaseEvent = {
  id: string;
  status?: string | null;
  recordingRequestStatus?: string | null;
  externalBotId?: string | null;
};

type CallRecordingDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CallRecordingForDatabaseEvent>
>;

// Created rows are scheduled inline by the run that inserts them; reacting to
// creations here would race that run into duplicate Recall creates. This
// trigger only resumes rows that fall back to pending later (a bot cleared
// after vanishing at Recall, a canceled request re-requested, a failed row
// reset by calendar reconciliation), which the recovery cron would otherwise
// pick up minutes later.
export const scheduleRecallBotOnCallRecordingUpdateHandler = async (
  event: CallRecordingDatabaseEvent,
): Promise<
  | { skipped: true; reason: string }
  | { callRecordingId: string; result: ResumePendingCallRecordingResult }
> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== CALL_RECORDING_OBJECT_NAME || action !== 'updated') {
    return { skipped: true, reason: 'not a call recording update' };
  }

  const updatedFields = event.properties.updatedFields ?? [];

  if (
    !updatedFields.some((updatedField) =>
      PENDING_TRANSITION_FIELDS.includes(updatedField),
    )
  ) {
    return { skipped: true, reason: 'no pending-transition field changed' };
  }

  if (contradictsPendingCallRecording(event.properties)) {
    return { skipped: true, reason: 'call recording is not pending' };
  }

  const result = await resumePendingCallRecording({
    client: new CoreApiClient(),
    callRecordingId: event.recordId,
    now: new Date(),
  });

  return { callRecordingId: event.recordId, result };
};

// Values can come from a full `after` snapshot or, on slim payloads, from the
// per-field diff; any known value that contradicts the pending shape lets the
// trigger skip without the authoritative fetch. Unknown values stay ambiguous
// and the resume flow re-fetches to decide.
const contradictsPendingCallRecording = (
  properties: CallRecordingDatabaseEvent['properties'],
): boolean => {
  const knownValues = properties.after ?? resolveDiffAfterValues(properties);

  return (
    (!isUndefined(knownValues.recordingRequestStatus) &&
      knownValues.recordingRequestStatus !==
        CallRecordingRequestStatus.REQUESTED) ||
    (!isUndefined(knownValues.status) &&
      knownValues.status !== CallRecordingStatus.SCHEDULED) ||
    (!isUndefined(knownValues.externalBotId) &&
      knownValues.externalBotId !== null)
  );
};

const resolveDiffAfterValues = (
  properties: CallRecordingDatabaseEvent['properties'],
): Partial<CallRecordingForDatabaseEvent> => {
  const diff = properties.diff ?? {};

  return {
    ...(isUndefined(diff.status) ? {} : { status: diff.status.after }),
    ...(isUndefined(diff.recordingRequestStatus)
      ? {}
      : { recordingRequestStatus: diff.recordingRequestStatus.after }),
    ...(isUndefined(diff.externalBotId)
      ? {}
      : { externalBotId: diff.externalBotId.after }),
  };
};

export default defineLogicFunction({
  universalIdentifier:
    SCHEDULE_RECALL_BOT_ON_CALL_RECORDING_UPDATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'schedule-recall-bot-on-call-recording-update',
  description:
    'Resumes Recall bot scheduling as soon as a call recording transitions back to pending instead of waiting for the recovery cron.',
  timeoutSeconds: 60,
  handler: scheduleRecallBotOnCallRecordingUpdateHandler,
  databaseEventTriggerSettings: {
    eventName: `${CALL_RECORDING_OBJECT_NAME}.updated`,
    updatedFields: PENDING_TRANSITION_FIELDS,
  },
});
