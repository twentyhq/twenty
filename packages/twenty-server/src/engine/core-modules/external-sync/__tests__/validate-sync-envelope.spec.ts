import { describe, expect, it } from '@jest/globals';

import {
  validateSyncEnvelope,
  isEchoEvent,
} from '../inbound/validate-sync-envelope.util';

describe('validateSyncEnvelope', () => {
  const validEnvelope = {
    eventId: 'evt-001',
    idempotencyKey: 'idem-001',
    eventVersion: '1.0',
    sourceSystem: 'DIRECTUS',
    sourceCollection: 'executives',
    sourceRecordId: 'rec-001',
    workspaceKey: 'ws-001',
    timestamp: '2026-07-16T00:00:00Z',
    payload: { name: 'John' },
  };

  it('validates a correct envelope', () => {
    const result = validateSyncEnvelope(validEnvelope);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects null/undefined', () => {
    expect(validateSyncEnvelope(null).valid).toBe(false);
    expect(validateSyncEnvelope(undefined).valid).toBe(false);
    expect(validateSyncEnvelope('string').valid).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = validateSyncEnvelope({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects unknown eventVersion', () => {
    const result = validateSyncEnvelope({
      ...validEnvelope,
      eventVersion: '99.0',
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('UNKNOWN_EVENT_VERSION');
  });

  it('rejects unknown sourceSystem', () => {
    const result = validateSyncEnvelope({
      ...validEnvelope,
      sourceSystem: 'UNKNOWN_SYSTEM',
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('UNKNOWN_SOURCE_SYSTEM');
  });

  it('rejects invalid timestamp', () => {
    const result = validateSyncEnvelope({
      ...validEnvelope,
      timestamp: 'not-a-date',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid timestamp: not ISO 8601');
  });
});

describe('isEchoEvent', () => {
  it('returns true for TWENTY source system', () => {
    expect(
      isEchoEvent({
        eventId: 'evt-echo',
        idempotencyKey: 'key-echo',
        eventVersion: '1.0',
        sourceSystem: 'TWENTY',
        sourceCollection: 'executives',
        sourceRecordId: 'rec-echo',
        workspaceKey: 'ws-echo',
        timestamp: '2026-07-16T00:00:00Z',
        payload: {},
      }),
    ).toBe(true);
  });

  it('returns false for DIRECTUS source system', () => {
    expect(
      isEchoEvent({
        eventId: 'evt-dir',
        idempotencyKey: 'key-dir',
        eventVersion: '1.0',
        sourceSystem: 'DIRECTUS',
        sourceCollection: 'executives',
        sourceRecordId: 'rec-dir',
        workspaceKey: 'ws-dir',
        timestamp: '2026-07-16T00:00:00Z',
        payload: {},
      }),
    ).toBe(false);
  });
});
