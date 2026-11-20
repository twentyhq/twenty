import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { isSlackAssistantRequestStale } from 'src/logic-functions/utils/is-slack-assistant-request-stale';

const NOW_MS = Date.parse('2026-11-20T12:00:00.000Z');
const LEASE_MS = SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000;

describe('isSlackAssistantRequestStale', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not consider a request touched within the lease stale', () => {
    expect(
      isSlackAssistantRequestStale({
        updatedAt: new Date(NOW_MS - LEASE_MS + 1000).toISOString(),
      }),
    ).toBe(false);
  });

  it('should consider a request untouched past the lease stale', () => {
    expect(
      isSlackAssistantRequestStale({
        updatedAt: new Date(NOW_MS - LEASE_MS - 1000).toISOString(),
      }),
    ).toBe(true);
  });

  it('should not consider a request without an update time stale', () => {
    expect(isSlackAssistantRequestStale({ updatedAt: undefined })).toBe(false);
  });
});
