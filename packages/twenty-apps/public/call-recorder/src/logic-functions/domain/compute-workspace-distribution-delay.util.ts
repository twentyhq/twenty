import { createHash } from 'crypto';

import { WORKSPACE_DISTRIBUTION_WINDOW_MS } from 'src/logic-functions/constants/workspace-distribution-window-ms';

// Every workspace's cron fires at the same instant; a stable per-workspace
// offset spreads the Recall traffic across the window instead of bursting it.
export const computeWorkspaceDistributionDelay = (
  workspaceId: string,
): number =>
  createHash('sha256').update(workspaceId).digest().readUInt32BE(0) %
  WORKSPACE_DISTRIBUTION_WINDOW_MS;
