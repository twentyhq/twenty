import { createHash } from 'crypto';

// Every workspace's cron fires in the same minute; a stable per-workspace
// offset spreads their API calls across the window, since all installs share
// one application rate limit.
export const computeWorkspaceDistributionDelay = (
  workspaceId: string,
  windowMs: number,
): number =>
  createHash('sha256').update(workspaceId).digest().readUInt32BE(0) % windowMs;
