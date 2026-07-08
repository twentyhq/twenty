import { beforeEach, describe, expect, it } from 'vitest';

import {
  RECALL_API_RATE_LIMIT_BURST,
  RECALL_API_RATE_LIMIT_PER_MINUTE,
} from 'src/logic-functions/constants/recall-api-rate-limit';
import {
  reserveRecallApiRateLimitSlotMs,
  resetRecallApiRateLimiter,
} from 'src/logic-functions/recall-api/recall-api-rate-limiter.util';

const NOW_MS = 1_000_000;
const MS_PER_TOKEN = 60_000 / RECALL_API_RATE_LIMIT_PER_MINUTE;

describe('reserveRecallApiRateLimitSlotMs', () => {
  beforeEach(() => {
    resetRecallApiRateLimiter();
  });

  it('serves the initial burst without waiting', () => {
    for (let slot = 0; slot < RECALL_API_RATE_LIMIT_BURST; slot++) {
      expect(reserveRecallApiRateLimitSlotMs(NOW_MS)).toBe(0);
    }
  });

  it('paces requests once the burst is exhausted', () => {
    for (let slot = 0; slot < RECALL_API_RATE_LIMIT_BURST; slot++) {
      reserveRecallApiRateLimitSlotMs(NOW_MS);
    }

    expect(reserveRecallApiRateLimitSlotMs(NOW_MS)).toBe(MS_PER_TOKEN);
  });

  it('refills a token after enough time has elapsed', () => {
    for (let slot = 0; slot < RECALL_API_RATE_LIMIT_BURST; slot++) {
      reserveRecallApiRateLimitSlotMs(NOW_MS);
    }

    expect(reserveRecallApiRateLimitSlotMs(NOW_MS + MS_PER_TOKEN)).toBe(0);
  });
});
