import { createHash } from 'crypto';

import { FATHOM_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS } from 'src/constants/fathom.constant';

export const computeWorkspaceDistributionDelay = (
  workspaceId: string,
): number =>
  createHash('sha256').update(workspaceId).digest().readUInt32BE(0) %
  FATHOM_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS;
