import { isUndefined } from '@sniptt/guards';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/domain/map-recall-status-code-to-call-recording-status.util';
import { normalizeRecallTimestamp } from 'src/logic-functions/recall-api/normalize-recall-timestamp.util';
import {
  type RecallBotSnapshot,
  type RecallBotStatusChange,
} from 'src/logic-functions/recall-api/recall-bot-snapshot.type';

export type RecallBotSyncState = {
  status: CallRecordingStatus | undefined;
  failureReason: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  externalRecordingId: string | undefined;
  isRecallRecordingDone: boolean;
};

// Derives the state a full webhook history would have produced from GET /bot.
export const extractRecallBotSyncState = (
  bot: RecallBotSnapshot,
): RecallBotSyncState => {
  const { statusChanges } = bot;
  const latestStatusChange = getLatestStatusChange(statusChanges);
  const status = mapRecallStatusCodeToCallRecordingStatus(
    latestStatusChange?.code,
  );
  const recording = bot.recordings[0];

  return {
    status,
    failureReason:
      status === CallRecordingStatus.FAILED
        ? latestStatusChange?.code
        : undefined,
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

const getLatestStatusChange = (
  statusChanges: RecallBotStatusChange[],
): RecallBotStatusChange | undefined =>
  statusChanges.reduce<RecallBotStatusChange | undefined>(
    (latestStatusChange, statusChange) => {
      if (isUndefined(latestStatusChange)) {
        return statusChange;
      }

      const statusChangeTime = getStatusChangeTime(statusChange);
      const latestStatusChangeTime = getStatusChangeTime(latestStatusChange);

      if (
        isUndefined(statusChangeTime) &&
        isUndefined(latestStatusChangeTime)
      ) {
        return statusChange;
      }

      if (isUndefined(statusChangeTime)) {
        return latestStatusChange;
      }

      if (isUndefined(latestStatusChangeTime)) {
        return statusChange;
      }

      return statusChangeTime >= latestStatusChangeTime
        ? statusChange
        : latestStatusChange;
    },
    undefined,
  );

const getStatusChangeTime = (
  statusChange: RecallBotStatusChange,
): number | undefined => {
  const normalizedTimestamp = normalizeRecallTimestamp(statusChange.createdAt);

  if (isUndefined(normalizedTimestamp)) {
    return undefined;
  }

  return new Date(normalizedTimestamp).getTime();
};

const findStatusChangeTimestamp = (
  statusChanges: RecallBotStatusChange[],
  code: string,
): string | undefined =>
  statusChanges.find((statusChange) => statusChange.code === code)?.createdAt;
