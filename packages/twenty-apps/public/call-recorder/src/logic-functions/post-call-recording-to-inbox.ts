import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { POST_CALL_RECORDING_TO_INBOX_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { isCallRecordingSummaryAvailable } from 'src/logic-functions/domain/is-call-recording-summary-available.util';
import { postCallRecordingToInbox } from 'src/logic-functions/flows/post-call-recording-to-inbox.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

const CALL_RECORDING_OBJECT_NAME = 'callRecording';
const SUMMARY_FIELD_NAME = 'summary';

type CallRecordingForDatabaseEvent = {
  id: string;
  summary?: { markdown?: string | null } | null;
};

type CallRecordingUpdateEvent = DatabaseEventPayload<
  ObjectRecordUpdateEvent<CallRecordingForDatabaseEvent>
>;

type CallRecordingDatabaseEvent = Pick<
  CallRecordingUpdateEvent,
  'name' | 'recordId'
> & { properties: Partial<CallRecordingUpdateEvent['properties']> };

export const postCallRecordingToInboxHandler = async (
  event: CallRecordingDatabaseEvent,
): Promise<object> => {
  const updatedFields = event.properties.updatedFields ?? [];

  if (
    event.name !== `${CALL_RECORDING_OBJECT_NAME}.updated` ||
    !updatedFields.includes(SUMMARY_FIELD_NAME)
  ) {
    return { skipped: true, reason: 'not a summary update' };
  }

  const summaryDiff = event.properties.diff?.summary;

  if (
    isDefined(summaryDiff) &&
    (isCallRecordingSummaryAvailable(summaryDiff.before?.markdown) ||
      !isCallRecordingSummaryAvailable(summaryDiff.after?.markdown))
  ) {
    return { skipped: true, reason: 'summary did not become available' };
  }

  try {
    const result = await postCallRecordingToInbox({
      client: new CoreApiClient(),
      callRecordingId: event.recordId,
    });

    return { callRecordingId: event.recordId, ...result };
  } catch (error) {
    throw buildRetryableStepFailure('call recording inbox message', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    POST_CALL_RECORDING_TO_INBOX_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'post-call-recording-to-inbox',
  description:
    'Posts a message in the inbox of each workspace member of a meeting the first time a recording of theirs gets a summary, once per member. Does nothing while Inbox is off.',
  timeoutSeconds: 60,
  handler: postCallRecordingToInboxHandler,
  databaseEventTriggerSettings: {
    eventName: `${CALL_RECORDING_OBJECT_NAME}.updated`,
    updatedFields: [SUMMARY_FIELD_NAME],
  },
});
