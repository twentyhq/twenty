import { describe, expect, it } from 'vitest';

import { computeOrphanedRecallBotCleanupDelay } from 'src/logic-functions/domain/compute-orphaned-recall-bot-cleanup-delay.util';

describe('computeOrphanedRecallBotCleanupDelay', () => {
  it('returns the same delay for the same workspace', () => {
    const workspaceId = '20202020-1111-4444-8888-303030303030';

    expect(computeOrphanedRecallBotCleanupDelay(workspaceId)).toBe(
      computeOrphanedRecallBotCleanupDelay(workspaceId),
    );
  });
});
