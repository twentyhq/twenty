import { describe, expect, it } from 'vitest';

import { buildCallRecorderPolicyResult } from 'src/logic-functions/domain/build-call-recorder-policy-result.util';
import { type CallRecorderPolicyCalendarEventInput } from 'src/logic-functions/types/call-recorder-policy-calendar-event-input.type';

const NOW = new Date('2026-01-01T12:00:00.000Z');

const buildCalendarEventInput = (
  overrides: Partial<CallRecorderPolicyCalendarEventInput>,
): CallRecorderPolicyCalendarEventInput => ({
  id: 'calendar-event-1',
  isCanceled: false,
  startsAt: '2026-01-01T13:00:00.000Z',
  endsAt: '2026-01-01T14:00:00.000Z',
  iCalUid: 'ical-uid-1',
  conferenceLinkUrl: 'https://meet.google.com/customer-sync',
  callRecorderPreference: undefined,
  ...overrides,
});

describe('buildCallRecorderPolicyResult', () => {
  it('requests a bot for the ON wire value even when record-by-default is disabled', () => {
    const policyResult = buildCallRecorderPolicyResult(
      buildCalendarEventInput({
        callRecorderPreference: 'ON',
      }),
      { now: NOW, isRecordByDefaultEnabled: false },
    );

    expect(policyResult.callRecorderPreference).toBe('ON');
    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('RECORDING_ENABLED');
  });

  it('does not request a bot for the OFF wire value', () => {
    const policyResult = buildCallRecorderPolicyResult(
      buildCalendarEventInput({
        callRecorderPreference: 'OFF',
      }),
      { now: NOW, isRecordByDefaultEnabled: true },
    );

    expect(policyResult.callRecorderPreference).toBe('OFF');
    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('PREFERENCE_OFF');
  });

  it('treats an unknown wire value as unset and follows an enabled default', () => {
    const policyResult = buildCallRecorderPolicyResult(
      buildCalendarEventInput({
        callRecorderPreference: 'UNKNOWN_VALUE',
      }),
      { now: NOW, isRecordByDefaultEnabled: true },
    );

    expect(policyResult.callRecorderPreference).toBeUndefined();
    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('RECORDING_ENABLED');
  });

  it('treats an unset preference as following a disabled default', () => {
    const policyResult = buildCallRecorderPolicyResult(
      buildCalendarEventInput({
        callRecorderPreference: undefined,
      }),
      { now: NOW, isRecordByDefaultEnabled: false },
    );

    expect(policyResult.callRecorderPreference).toBeUndefined();
    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('RECORD_BY_DEFAULT_DISABLED');
  });
});
