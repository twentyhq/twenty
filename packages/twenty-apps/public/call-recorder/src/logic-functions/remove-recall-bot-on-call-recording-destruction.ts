import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDestroyEvent,
} from 'twenty-sdk/define';

import { REMOVE_RECALL_BOT_ON_CALL_RECORDING_DESTRUCTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/remove-recall-bot-on-call-recording-destruction-logic-function-universal-identifier';
import { isRecallBotRemovalCallRecordingStatus } from 'src/logic-functions/domain/is-recall-bot-removal-call-recording-status.util';
import { removeRecallBotsForCallRecording } from 'src/logic-functions/flows/remove-recall-bots-for-call-recording.util';

type CallRecordingForDestructionEvent = {
  id: string;
  status?: string | null;
  externalBotId?: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
};

type CallRecordingDestructionEvent = DatabaseEventPayload<
  ObjectRecordDestroyEvent<CallRecordingForDestructionEvent>
>;

export const removeRecallBotOnCallRecordingDestructionHandler = async (
  event: CallRecordingDestructionEvent,
): Promise<{ removedExternalBotIds: string[] }> => {
  const callRecording = event.properties.before;
  const externalBotId = callRecording.externalBotId ?? undefined;
  const botScheduleAttemptedAt =
    callRecording.botScheduleAttemptedAt ?? undefined;
  const botScheduleIdempotencyKey =
    callRecording.botScheduleIdempotencyKey ?? undefined;
  const removedExternalBotIds = await removeRecallBotsForCallRecording({
    callRecordingId: event.recordId,
    status: callRecording.status ?? undefined,
    externalBotId,
    botScheduleAttemptedAt,
    botScheduleIdempotencyKey,
  });

  if (
    isRecallBotRemovalCallRecordingStatus(
      callRecording.status ?? undefined,
    ) &&
    externalBotId === undefined &&
    (botScheduleAttemptedAt !== undefined ||
      botScheduleIdempotencyKey !== undefined) &&
    removedExternalBotIds.length === 0
  ) {
    throw new Error('Attempted Recall bot is not visible yet');
  }

  return { removedExternalBotIds };
};

export default defineLogicFunction({
  universalIdentifier:
    REMOVE_RECALL_BOT_ON_CALL_RECORDING_DESTRUCTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'remove-recall-bot-on-call-recording-destruction',
  description:
    'Best-effort removal of a Recall bot when its CallRecording is destroyed.',
  timeoutSeconds: 60,
  handler: removeRecallBotOnCallRecordingDestructionHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.destroyed',
  },
});
