import { createHash } from 'node:crypto';

import { GRANOLA_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS } from 'src/constants/granola-history.constant';

// Every workspace's cron fires at the same instant; a stable per-workspace
// offset spreads the shared Twenty API traffic across the window instead of bursting it
export const computeWorkspaceDistributionDelay = (
  workspaceId: string,
): number =>
  createHash('sha256').update(workspaceId).digest().readUInt32BE(0) %
  GRANOLA_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS;
