import { type RecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/types/record-page-reown-updates.type';

export const countRecordPageReownUpdates = (
  reownUpdates: RecordPageReownUpdates,
): number =>
  Object.values(reownUpdates).reduce(
    (count, updates) => count + updates.length,
    0,
  );
