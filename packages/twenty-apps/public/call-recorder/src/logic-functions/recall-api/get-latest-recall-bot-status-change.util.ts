import { isUndefined } from '@sniptt/guards';

import { normalizeRecallTimestamp } from 'src/logic-functions/recall-api/normalize-recall-timestamp.util';
import { type RecallBotStatusChange } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';

// Recall does not guarantee status_changes ordering, so the latest entry is
// picked by timestamp, not array position.
export const getLatestRecallBotStatusChange = (
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
