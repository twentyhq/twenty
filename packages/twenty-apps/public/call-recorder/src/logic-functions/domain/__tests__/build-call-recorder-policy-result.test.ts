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
  conferenceLinkUrl: 'https://meet.example.com/customer-sync',
  callRecorderPreference: undefined,
  ...overrides,
});

describe('buildCallRecorderPolicyResult', () => {
  it('requests a bot for the ON wire value', () => {
    const policyResult = buildCallRecorderPolicyResult(
      buildCalendarEventInput({
        callRecorderPreference: 'ON',
      }),
      NOW,
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
      NOW,
    );

    expect(policyResult.callRecorderPreference).toBe('OFF');
    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('PREFERENCE_OFF');
  });
});
