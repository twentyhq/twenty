import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDestroyEvent,
} from 'twenty-sdk/define';

import { REMOVE_RECALL_BOT_ON_CALL_RECORDING_DESTRUCTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/remove-recall-bot-on-call-recording-destruction-logic-function-universal-identifier';
import {
  removeRecallBotsForRemovedCallRecording,
  type RemovedCallRecordingRecallFields,
} from 'src/logic-functions/flows/remove-recall-bots-for-removed-call-recording.util';

const CALL_RECORDING_DESTROYED_EVENT_NAME = 'callRecording.destroyed';

type CallRecordingDestroyedEvent = DatabaseEventPayload<
  ObjectRecordDestroyEvent<RemovedCallRecordingRecallFields>
>;

export const removeRecallBotOnCallRecordingDestructionHandler = async (
  event: CallRecordingDestroyedEvent,
) => {
  if (event.name !== CALL_RECORDING_DESTROYED_EVENT_NAME) {
    return { skipped: true, reason: 'not a call recording destruction' };
  }

  return removeRecallBotsForRemovedCallRecording({
    callRecordingId: event.recordId,
    externalBotId: event.properties.before.externalBotId,
    botScheduleAttemptedAt: event.properties.before.botScheduleAttemptedAt,
  });
};

export default defineLogicFunction({
  universalIdentifier:
    REMOVE_RECALL_BOT_ON_CALL_RECORDING_DESTRUCTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'remove-recall-bot-on-call-recording-destruction',
  description:
    'Removes the Recall bot when its CallRecording is permanently destroyed.',
  timeoutSeconds: 60,
  handler: removeRecallBotOnCallRecordingDestructionHandler,
  databaseEventTriggerSettings: {
    eventName: CALL_RECORDING_DESTROYED_EVENT_NAME,
  },
});
