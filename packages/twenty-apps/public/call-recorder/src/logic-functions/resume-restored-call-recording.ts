import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { RESUME_RESTORED_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/resume-restored-call-recording-logic-function-universal-identifier';
import {
  resumeRestoredCallRecording,
  type ResumeRestoredCallRecordingResult,
} from 'src/logic-functions/flows/resume-restored-call-recording.util';

type CallRecordingRestorationEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<{ id?: string | null }>
>;

export const resumeRestoredCallRecordingHandler = async (
  event: CallRecordingRestorationEvent,
  context: LogicFunctionExecutionContext,
): Promise<
  ResumeRestoredCallRecordingResult | { status: 'skippedEvent'; reason: string }
> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== 'callRecording' || action !== 'restored') {
    return {
      status: 'skippedEvent',
      reason: 'not a callRecording restore event',
    };
  }

  return resumeRestoredCallRecording({
    client: new CoreApiClient(),
    callRecordingId: event.recordId,
    retry: {
      retryCount: context.retryCount,
      maxRetries: context.maxRetries,
    },
  });
};

export default defineLogicFunction({
  universalIdentifier:
    RESUME_RESTORED_CALL_RECORDING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'resume-restored-call-recording',
  description:
    'Re-establishes bot state for a restored call recording: keeps a still-live bot, clears a dead one, and reschedules.',
  timeoutSeconds: 60,
  handler: resumeRestoredCallRecordingHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.restored',
  },
});
