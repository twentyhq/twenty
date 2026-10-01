import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { NOTIFY_FIRST_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { notifyFirstCallRecording } from 'src/logic-functions/flows/notify-first-call-recording.util';
import { type NotifyFirstCallRecordingResult } from 'src/logic-functions/types/notify-first-call-recording-result.type';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

type CallRecordingDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<{ id: string; status?: string | null }>
>;

export const notifyFirstCallRecordingHandler = async (
  event: CallRecordingDatabaseEvent,
): Promise<
  | { skipped: true; reason: string }
  | ({ callRecordingId: string } & NotifyFirstCallRecordingResult)
> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== 'callRecording' || action !== 'updated') {
    return { skipped: true, reason: 'not a call recording update' };
  }

  if (!(event.properties.updatedFields ?? []).includes('status')) {
    return { skipped: true, reason: 'status unchanged' };
  }

  const knownStatus =
    event.properties.after?.status ?? event.properties.diff?.status?.after;

  if (
    !isUndefined(knownStatus) &&
    knownStatus !== CallRecordingStatus.COMPLETED
  ) {
    return { skipped: true, reason: 'call recording is not completed' };
  }

  try {
    const result = await notifyFirstCallRecording(new CoreApiClient(), {
      callRecordingId: event.recordId,
    });

    return { callRecordingId: event.recordId, ...result };
  } catch (error) {
    throw buildRetryableStepFailure('first call recording notification', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    NOTIFY_FIRST_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'notify-first-call-recording',
  description:
    'Messages each attendee in Twenty when their first call recording is ready, and offers to share it with the other attendees.',
  timeoutSeconds: 60,
  handler: notifyFirstCallRecordingHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.updated',
    updatedFields: ['status'],
  },
});
