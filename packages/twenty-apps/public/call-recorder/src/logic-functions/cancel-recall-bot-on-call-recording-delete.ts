import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { CANCEL_RECALL_BOT_ON_CALL_RECORDING_DELETE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const CALL_RECORDING_OBJECT_NAME = 'callRecording';

type CallRecordingForDeleteEvent = {
  id: string;
  externalBotId?: string | null;
};

type CallRecordingDeleteEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CallRecordingForDeleteEvent>
>;

type CancelRecallBotOnCallRecordingDeleteResult =
  | { skipped: true; reason: string }
  | {
      callRecordingId: string;
      externalBotId: string;
      canceled: boolean;
    };

export const cancelRecallBotOnCallRecordingDeleteHandler = async (
  event: CallRecordingDeleteEvent,
): Promise<CancelRecallBotOnCallRecordingDeleteResult> => {
  if (event.name !== `${CALL_RECORDING_OBJECT_NAME}.deleted`) {
    return { skipped: true, reason: 'not a call recording deletion' };
  }

  const externalBotId = event.properties.before?.externalBotId;

  if (!isNonEmptyString(externalBotId)) {
    return { skipped: true, reason: 'call recording has no Recall bot' };
  }

  const normalizedExternalBotId = externalBotId.trim();
  const canceled = await cancelOrEjectRecallBot(normalizedExternalBotId);

  return {
    callRecordingId: event.recordId,
    externalBotId: normalizedExternalBotId,
    canceled,
  };
};

export default defineLogicFunction({
  universalIdentifier:
    CANCEL_RECALL_BOT_ON_CALL_RECORDING_DELETE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cancel-recall-bot-on-call-recording-delete',
  description:
    'Best-effort cancellation or ejection of a Recall bot when its CallRecording is deleted.',
  timeoutSeconds: 60,
  handler: cancelRecallBotOnCallRecordingDeleteHandler,
  databaseEventTriggerSettings: {
    eventName: `${CALL_RECORDING_OBJECT_NAME}.deleted`,
  },
});
