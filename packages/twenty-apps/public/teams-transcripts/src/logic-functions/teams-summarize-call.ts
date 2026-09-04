import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { TEAMS_SUMMARIZE_CALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { generateCallSummary } from 'src/logic-functions/utils/generate-call-summary.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const CALL_RECORDING_OBJECT_NAME = 'callRecording';
const TRANSCRIPT_FIELD_NAME = 'transcript';

type CallRecordingDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<{ id: string }>
>;

export const teamsSummarizeCallHandler = async (
  event: CallRecordingDatabaseEvent,
): Promise<object> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== CALL_RECORDING_OBJECT_NAME || action !== 'updated') {
    return { skipped: true, reason: 'not a call recording update' };
  }

  if (!(event.properties.updatedFields ?? []).includes(TRANSCRIPT_FIELD_NAME)) {
    return { skipped: true, reason: 'transcript unchanged' };
  }

  try {
    const result = await generateCallSummary({
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      callRecordingId: event.recordId,
    });

    return { callRecordingId: event.recordId, ...result };
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `Teams call summarization failed: ${toErrorMessage(error)}`,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_SUMMARIZE_CALL_UNIVERSAL_IDENTIFIER,
  name: 'teams-summarize-call',
  description:
    'Generates an AI recap when a Teams transcript lands on a Call Recording this app created, and stores it on the summary field.',
  timeoutSeconds: 60 * 4,
  handler: teamsSummarizeCallHandler,
  databaseEventTriggerSettings: {
    eventName: `${CALL_RECORDING_OBJECT_NAME}.updated`,
  },
});
