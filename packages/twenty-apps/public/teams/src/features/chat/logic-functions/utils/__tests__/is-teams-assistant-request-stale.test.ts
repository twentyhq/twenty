import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';
import { isTeamsAssistantRequestStale } from 'src/features/chat/logic-functions/utils/is-teams-assistant-request-stale';

const NOW_MS = Date.parse('2026-11-20T12:00:00.000Z');
const LEASE_MS = TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000;

describe('isTeamsAssistantRequestStale', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not consider a request touched within the lease stale', () => {
    expect(
      isTeamsAssistantRequestStale({
        updatedAt: new Date(NOW_MS - LEASE_MS + 1000).toISOString(),
      }),
    ).toBe(false);
  });

  it('should consider a request untouched past the lease stale', () => {
    expect(
      isTeamsAssistantRequestStale({
        updatedAt: new Date(NOW_MS - LEASE_MS - 1000).toISOString(),
      }),
    ).toBe(true);
  });

  it('should not consider a request without an update time stale', () => {
    expect(isTeamsAssistantRequestStale({ updatedAt: undefined })).toBe(false);
  });
});
