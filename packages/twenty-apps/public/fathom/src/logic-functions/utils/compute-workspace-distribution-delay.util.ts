import { createHash } from 'crypto';

import { FATHOM_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS } from 'src/constants/fathom.constant';

// Every workspace's cron fires at the same instant; a stable per-workspace
// offset spreads the shared Twenty API budget across the window instead.
export const computeWorkspaceDistributionDelay = (
  workspaceId: string,
): number =>
  createHash('sha256').update(workspaceId).digest().readUInt32BE(0) %
  FATHOM_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS;
