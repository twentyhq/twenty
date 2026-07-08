import { beforeEach, describe, expect, it } from 'vitest';

import {
  resetRecallApiRateLimiter,
  reserveRecallApiRateLimitSlotMs,
} from 'src/logic-functions/recall-api/recall-api-rate-limiter.util';
import { RECALL_API_ENDPOINT_RATE_LIMIT_BURST } from 'src/logic-functions/constants/recall-api-rate-limit';

describe('recall api rate limiter', () => {
  beforeEach(() => {
    resetRecallApiRateLimiter();
  });

  it('smooths GET /bot/{id} at the current 120/minute Recall ceiling across bot ids', () => {
    const nowMs = 1_000;

    for (
      let reservationIndex = 0;
      reservationIndex < RECALL_API_ENDPOINT_RATE_LIMIT_BURST;
      reservationIndex++
    ) {
      reserveRecallApiRateLimitSlotMs({
        method: 'GET',
        path: `/bot/recall-bot-${reservationIndex}/`,
        nowMs,
      });
    }

    expect(
      reserveRecallApiRateLimitSlotMs({
        method: 'GET',
        path: '/bot/recall-bot-final/',
        nowMs,
      }),
    ).toBe(500);
  });

  it('does not make GET /bot/{id} consume POST /bot/ capacity', () => {
    const nowMs = 1_000;

    for (
      let reservationIndex = 0;
      reservationIndex < RECALL_API_ENDPOINT_RATE_LIMIT_BURST;
      reservationIndex++
    ) {
      reserveRecallApiRateLimitSlotMs({
        method: 'GET',
        path: `/bot/recall-bot-${reservationIndex}/`,
        nowMs,
      });
    }

    expect(
      reserveRecallApiRateLimitSlotMs({
        method: 'POST',
        path: '/bot/',
        nowMs,
      }),
    ).toBe(0);
  });
});
