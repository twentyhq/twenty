import { afterEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
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
  participantWorkspaceMemberIds: [],
  ...overrides,
});

describe('buildCallRecorderPolicyResult', () => {
  afterEach(() => {
    delete process.env[
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME
    ];
  });

  it('requests a bot for the ON wire value', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        callRecorderPreference: 'ON',
      }),
      optedInWorkspaceMemberIds: new Set(),
      now: NOW,
    });

    expect(policyResult.callRecorderPreference).toBe('ON');
    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('RECORDING_ENABLED');
  });

  it('does not request a bot for the OFF wire value', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        callRecorderPreference: 'OFF',
      }),
      optedInWorkspaceMemberIds: new Set(),
      now: NOW,
    });

    expect(policyResult.callRecorderPreference).toBe('OFF');
    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('PREFERENCE_OFF');
  });

  it('does not request a bot when the workspace turned calendar bot scheduling off', () => {
    process.env[CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME] =
      'false';

    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        callRecorderPreference: 'ON',
      }),
      optedInWorkspaceMemberIds: new Set(),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('CALENDAR_BOT_SCHEDULING_DISABLED');
  });

  it('does not request a bot when the attributed attendees all opted out', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
      }),
      optedInWorkspaceMemberIds: new Set(['member-3']),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('ATTENDEES_OPTED_OUT');
  });

  it('requests a bot when at least one attributed attendee is opted in', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
      }),
      optedInWorkspaceMemberIds: new Set(['member-2']),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(true);
  });

  it('requests a bot when no attendee matches a workspace member', () => {
    const policyResult = buildCallRecorderPolicyResult({
      calendarEvent: buildCalendarEventInput({
        participantWorkspaceMemberIds: [],
      }),
      optedInWorkspaceMemberIds: new Set(),
      now: NOW,
    });

    expect(policyResult.shouldRequestBot).toBe(true);
  });
});
