import { describe, expect, it } from 'vitest';

import {
  isRecallAccountStatus,
  isRetryableRecallApiStatus,
} from 'src/logic-functions/recall-api/recall-api-retry-policy.util';

describe('recall api retry policy', () => {
  it('retries rate limits, conflicts and server errors', () => {
    expect(isRetryableRecallApiStatus(429)).toBe(true);
    expect(isRetryableRecallApiStatus(409)).toBe(true);
    expect(isRetryableRecallApiStatus(503)).toBe(true);
    expect(isRetryableRecallApiStatus(400)).toBe(false);
  });

  it('separates account statuses from request rejections', () => {
    expect(isRecallAccountStatus(401)).toBe(true);
    expect(isRecallAccountStatus(402)).toBe(true);
    expect(isRecallAccountStatus(403)).toBe(true);
    expect(isRecallAccountStatus(400)).toBe(false);
    expect(isRecallAccountStatus(404)).toBe(false);
  });
});
