import { createHash } from 'node:crypto';

import { GRANOLA_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS } from 'src/constants/granola-history.constant';

export const computeWorkspaceDistributionDelay = (
  workspaceId: string,
): number =>
  createHash('sha256').update(workspaceId).digest().readUInt32BE(0) %
  GRANOLA_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS;
