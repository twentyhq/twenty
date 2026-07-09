import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

export type FindScheduledRecallBotIdResult =
  | { ok: true; externalBotId: string | undefined }
  | { ok: false };

export const findScheduledRecallBotIdForCallRecording = async ({
  callRecordingId,
  workspaceId,
  joinAtAfter,
  joinAtBefore,
}: {
  callRecordingId: string;
  workspaceId: string;
  joinAtAfter: string;
  joinAtBefore: string;
}): Promise<FindScheduledRecallBotIdResult> => {
  const listResult = await listScheduledRecallBots({
    joinAtAfter,
    joinAtBefore,
    metadata: {
      twentyWorkspaceId: workspaceId,
      twentyCallRecordingId: callRecordingId,
    },
  });

  if (!listResult.ok) {
    console.warn(
      `[call-recorder] failed to look up existing Recall bot for call recording ${callRecordingId}: ${listResult.errorMessage}`,
    );

    return { ok: false };
  }

  return { ok: true, externalBotId: listResult.bots[0]?.id };
};
