import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { findScheduledRecallBotIdForCallRecording } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-id-for-call-recording.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

export type AttachExistingRecallBotToCallRecordingResult =
  | { status: 'attached'; externalBotId: string }
  | { status: 'no-existing-bot' }
  | { status: 'lookup-failed' };

// A run that POSTed a bot but died before the id write-back leaves the bot claimable by metadata; attaching it instead of re-POSTing prevents duplicate bots.
export const attachExistingRecallBotToCallRecording = async (
  client: CoreApiClient,
  { callRecording }: { callRecording: CallRecordingRecord },
): Promise<AttachExistingRecallBotToCallRecordingResult> => {
  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    return { status: 'no-existing-bot' };
  }

  const findResult = await findScheduledRecallBotIdForCallRecording({
    callRecordingId: callRecording.id,
    workspaceId,
  });

  if (!findResult.ok) {
    return { status: 'lookup-failed' };
  }

  if (isUndefined(findResult.externalBotId)) {
    return { status: 'no-existing-bot' };
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: { externalBotId: findResult.externalBotId },
  });

  return { status: 'attached', externalBotId: findResult.externalBotId };
};
