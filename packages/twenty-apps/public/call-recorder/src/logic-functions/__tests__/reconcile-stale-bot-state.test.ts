import { describe, expect, it } from 'vitest';

import reconcileStaleBotStateLogicFunction from 'src/logic-functions/reconcile-stale-bot-state';

describe('reconcile-stale-bot-state', () => {
  it('is configured as an hourly cron', () => {
    expect(reconcileStaleBotStateLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-stale-bot-state',
        cronTriggerSettings: { pattern: '30 * * * *' },
      }),
    );
  });
});
