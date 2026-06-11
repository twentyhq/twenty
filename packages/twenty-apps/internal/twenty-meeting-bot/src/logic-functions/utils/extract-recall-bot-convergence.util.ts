import { isArray, isUndefined } from '@sniptt/guards';

import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/utils/map-recall-status-code-to-call-recording-status.util';
import { normalizeRecallTimestamp } from 'src/logic-functions/utils/normalize-recall-timestamp.util';

export type RecallBotConvergence = {
  status: CallRecordingStatus | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  externalRecordingId: string | undefined;
  isRecallRecordingDone: boolean;
};

type RecallBotStatusChange = {
  code: string;
  createdAt: string | undefined;
};

// Derives the state a full webhook history would have produced from GET /bot.
export const extractRecallBotConvergence = (
  bot: Record<string, unknown>,
): RecallBotConvergence => {
  const statusChanges = extractStatusChanges(bot);
  const latestStatusChange = statusChanges[statusChanges.length - 1];
  const recording = extractFirstRecording(bot);

  return {
    status: mapRecallStatusCodeToCallRecordingStatus(latestStatusChange?.code),
    startedAt: normalizeRecallTimestamp(
      recording?.startedAt ??
        findStatusChangeTimestamp(statusChanges, 'in_call_recording'),
    ),
    endedAt: normalizeRecallTimestamp(
      recording?.completedAt ??
        findStatusChangeTimestamp(statusChanges, 'call_ended'),
    ),
    externalRecordingId: recording?.id,
    isRecallRecordingDone:
      !isUndefined(recording?.completedAt) ||
      statusChanges.some((statusChange) => statusChange.code === 'done'),
  };
};

const extractStatusChanges = (
  bot: Record<string, unknown>,
): RecallBotStatusChange[] => {
  if (!isArray(bot.status_changes)) {
    return [];
  }

  return bot.status_changes.flatMap((statusChange: unknown) => {
    const code = getString(asRecord(statusChange)?.code);

    if (isUndefined(code)) {
      return [];
    }

    return [{ code, createdAt: getString(asRecord(statusChange)?.created_at) }];
  });
};

const extractFirstRecording = (
  bot: Record<string, unknown>,
):
  | {
      id: string | undefined;
      startedAt: string | undefined;
      completedAt: string | undefined;
    }
  | undefined => {
  if (!isArray(bot.recordings)) {
    return undefined;
  }

  const recording = asRecord(bot.recordings[0]);

  if (isUndefined(recording)) {
    return undefined;
  }

  return {
    id: getString(recording.id),
    startedAt: getString(recording.started_at),
    completedAt: getString(recording.completed_at),
  };
};

const findStatusChangeTimestamp = (
  statusChanges: RecallBotStatusChange[],
  code: string,
): string | undefined =>
  statusChanges.find((statusChange) => statusChange.code === code)?.createdAt;
