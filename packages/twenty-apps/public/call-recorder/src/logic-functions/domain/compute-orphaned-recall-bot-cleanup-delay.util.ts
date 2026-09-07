import { createHash } from 'crypto';

import { ORPHANED_RECALL_BOT_CLEANUP_DISTRIBUTION_WINDOW_MS } from 'src/logic-functions/constants/orphaned-recall-bot-cleanup-distribution-window-ms';

export const computeOrphanedRecallBotCleanupDelay = (
  workspaceId: string,
): number =>
  createHash('sha256').update(workspaceId).digest().readUInt32BE(0) %
  ORPHANED_RECALL_BOT_CLEANUP_DISTRIBUTION_WINDOW_MS;
