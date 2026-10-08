import { describe, expect, it } from 'vitest';

import { GRANOLA_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS } from 'src/constants/granola-history.constant';
import { computeWorkspaceDistributionDelay } from 'src/logic-functions/utils/compute-workspace-distribution-delay.util';

describe('computeWorkspaceDistributionDelay', () => {
  it('returns the same delay for the same workspace', () => {
    const workspaceId = '20202020-1111-4444-8888-303030303030';

    expect(computeWorkspaceDistributionDelay(workspaceId)).toBe(
      computeWorkspaceDistributionDelay(workspaceId),
    );
  });

  it('spreads different workspaces across the window', () => {
    expect(
      computeWorkspaceDistributionDelay('20202020-1111-4444-8888-303030303030'),
    ).not.toBe(
      computeWorkspaceDistributionDelay('20202020-2222-4444-8888-303030303030'),
    );
  });

  it('stays inside the distribution window', () => {
    const delayMilliseconds = computeWorkspaceDistributionDelay(
      '20202020-2222-4444-8888-303030303030',
    );

    expect(delayMilliseconds).toBeGreaterThanOrEqual(0);
    expect(delayMilliseconds).toBeLessThan(
      GRANOLA_WORKSPACE_DISTRIBUTION_WINDOW_MILLISECONDS,
    );
  });
});
