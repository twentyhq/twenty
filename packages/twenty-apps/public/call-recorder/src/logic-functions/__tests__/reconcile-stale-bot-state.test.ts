import { describe, expect, it } from 'vitest';

import reconcileStaleBotStateLogicFunction from 'src/logic-functions/reconcile-stale-bot-state';

describe('reconcile-stale-bot-state', () => {
  // This sweep is the only safety net for an import pass that never ran, so its
  // period bounds how long a recording can sit visibly processing.
  it('is configured as an hourly cron', () => {
    expect(reconcileStaleBotStateLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-stale-bot-state',
        cronTriggerSettings: { pattern: '30 * * * *' },
      }),
    );
  });
});
