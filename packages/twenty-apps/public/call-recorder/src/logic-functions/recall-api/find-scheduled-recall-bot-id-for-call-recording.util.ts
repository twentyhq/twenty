import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

const ACTIVE_RECALL_BOT_STATUSES = [
  'ready',
  'joining_call',
  'in_waiting_room',
  'in_call_not_recording',
  'recording_permission_allowed',
  'recording_permission_denied',
  'in_call_recording',
];

export type FindScheduledRecallBotIdResult =
  | { ok: true; externalBotId: string | undefined }
  | { ok: false };

export const findScheduledRecallBotIdForCallRecording = async ({
  callRecordingId,
  workspaceId,
}: {
  callRecordingId: string;
  workspaceId: string;
}): Promise<FindScheduledRecallBotIdResult> => {
  const listResult = await listScheduledRecallBots({
    metadata: {
      twentyWorkspaceId: workspaceId,
      twentyCallRecordingId: callRecordingId,
    },
    statuses: ACTIVE_RECALL_BOT_STATUSES,
  });

  if (!listResult.ok) {
    console.warn(
      `[call-recorder] failed to look up existing Recall bot for call recording ${callRecordingId}: ${listResult.errorMessage}`,
    );

    return { ok: false };
  }

  return { ok: true, externalBotId: listResult.bots[0]?.id };
};
