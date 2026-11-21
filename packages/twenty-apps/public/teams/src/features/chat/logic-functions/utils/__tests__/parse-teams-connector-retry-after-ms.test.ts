import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseTeamsConnectorRetryAfterMs } from 'src/features/chat/logic-functions/utils/parse-teams-connector-retry-after-ms';

describe('parseTeamsConnectorRetryAfterMs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return undefined when the header is missing or empty', () => {
    expect(parseTeamsConnectorRetryAfterMs(null)).toBeUndefined();
    expect(parseTeamsConnectorRetryAfterMs(undefined)).toBeUndefined();
    expect(parseTeamsConnectorRetryAfterMs('')).toBeUndefined();
  });

  it('should read a delay in seconds', () => {
    expect(parseTeamsConnectorRetryAfterMs('2')).toBe(2_000);
    expect(parseTeamsConnectorRetryAfterMs('0.5')).toBe(500);
  });

  it('should read an HTTP date as the time left until it', () => {
    expect(
      parseTeamsConnectorRetryAfterMs('Thu, 01 Jan 2026 00:00:03 GMT'),
    ).toBe(3_000);
  });

  it('should never return a negative delay', () => {
    expect(parseTeamsConnectorRetryAfterMs('-5')).toBe(0);
    expect(
      parseTeamsConnectorRetryAfterMs('Wed, 31 Dec 2025 23:59:00 GMT'),
    ).toBe(0);
  });

  it('should return undefined for an unparseable value', () => {
    expect(parseTeamsConnectorRetryAfterMs('soon')).toBeUndefined();
  });
});
