import { isArray, isUndefined } from '@sniptt/guards';

import {
  type RecallBotRecording,
  type RecallBotSnapshot,
  type RecallBotStatusChange,
} from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const parseRecallBotSnapshot = (
  payload: Record<string, unknown>,
): RecallBotSnapshot => ({
  id: getString(payload.id),
  metadata: asRecord(payload.metadata) ?? {},
  statusChanges: parseStatusChanges(payload.status_changes),
  recordings: parseRecordings(payload.recordings),
});

const parseStatusChanges = (value: unknown): RecallBotStatusChange[] => {
  if (!isArray(value)) {
    return [];
  }

  return value.flatMap((statusChange: unknown) => {
    const code = getString(asRecord(statusChange)?.code);

    if (isUndefined(code)) {
      return [];
    }

    return [{ code, createdAt: getString(asRecord(statusChange)?.created_at) }];
  });
};

const parseRecordings = (value: unknown): RecallBotRecording[] => {
  if (!isArray(value)) {
    return [];
  }

  return value.flatMap((recording: unknown) => {
    const recordingRecord = asRecord(recording);

    if (isUndefined(recordingRecord)) {
      return [];
    }

    return [
      {
        id: getString(recordingRecord.id),
        startedAt: getString(recordingRecord.started_at),
        completedAt: getString(recordingRecord.completed_at),
      },
    ];
  });
};
