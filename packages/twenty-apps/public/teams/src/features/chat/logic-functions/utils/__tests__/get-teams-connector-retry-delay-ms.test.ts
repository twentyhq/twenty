import { describe, expect, it } from 'vitest';

import { getTeamsConnectorRetryDelayMs } from 'src/features/chat/logic-functions/utils/get-teams-connector-retry-delay-ms';

describe('getTeamsConnectorRetryDelayMs', () => {
  it('should give up when the one second floor on Retry-After exceeds the remaining budget', () => {
    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 1,
        retryAfterMs: 0,
        maxDelayMs: 500,
      }),
    ).toBe(0);
  });
});
